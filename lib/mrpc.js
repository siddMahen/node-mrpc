var events   = require("eventemitter2"),
    traverse = require("traverse"),
    msgpack  = require("msgpack3"),
    hashify  = require("hashify"),
    domain   = require("domain"),
    weak     = require("weak"),
    util     = require("util"),
    net      = require("net");

var slice = Array.prototype.slice;

/*
 * Creates an instance of mrpc.
 *
 * @param { Object } fns
 *
 * The fns parameter should be a map of functions.
 *
 * The returned object is an instance of EventEmitter2 and emits the following
 * events:
 *
 * "error"  -> function(err){ }
 * "remote" -> function(remote){ }
 * "end"    -> function(){ }
 *
 * These events are emitted when mrpc encounters an error, estabilishes a
 * connection with a remote mrpc server and terminates, respectively.
 *
 * mrpc does not support wildcard events.
 *
 * @returns { mrpc } rpc
 *
 * @api public
 */

var mrpc = function(fns){
    if(!(this instanceof mrpc))
        return new mrpc(fns);

    fns = fns || {};

    var self = this;

    events.EventEmitter2.call(this, {
        wildcard: false,
        maxListeners: Infinity
    });

    this.domain = domain.create();

    this.server = net.createServer(this.domain.bind(function(socket){
        var buffs = [], size = 0;

        socket.on("data", function(data){
            if(typeof data === "string"){
                size += Buffer.byteLength(data);
                buffs.push(Buffer(data));
            }else{
                size += data.length;
                buffs.push(data);
            }
        });

        socket.on("end", function(){
            var obj = msgpack.unpack(Buffer.concat(buffs, size));
            self.handle(obj);
        });
    }));

    this.domain.add(this.server);
    this.domain.on("error", function(err){
        self.emit("error", err);
    });

    this.local = fns;

    this.local["methods"] = function(cb){
        cb(self.local);
    };

    this.local["prune"] = function(id){
        delete self.remote[id];
    }

    this.remote = {};
}

// Inherits from EventEmitter2
util.inherits(mrpc, events.EventEmitter2);

/*
 * Handles incoming data.
 *
 * @param { Array } data
 *
 * The data array should be composed of 6 pieces in the following order:
 *
 * - The sender's port                             { Number }
 * - The sender's host address                     { String }
 * - The name or id of the function to be executed { Number || String }
 * - The arguments to the previous function        { Array }
 * - The map of callbacks for the arguments        { Object }
 * - The array of cirrcular references in the args { Array }
 *
 * The function named or identified will be executed with the arguments
 * and the callbacks found in the callback map.
 *
 * @api private
 */

mrpc.prototype.handle = function(data){
    var self   = this,
        port   = data[0],
        host   = data[1],
        method = data[2],
        args   = data[3],
        cbs    = data[4],
        links  = data[5],
        fn     = self.local[method] || self.remote[method],
        keys   = Object.keys(cbs);

    for(var i = 0; i < keys.length; i++){
        var id = keys[i],
            path = cbs[id],
            f = (function(idd){
                return function(){
                    var obj = self.scrub(idd, slice.call(arguments, 0));
                    self.send(port, host, obj);
                }
            })(id);

        weak(f, (function(idd){
            return function(){
                var obj = self.scrub("prune", [idd]);
                self.send(port, host, obj);
            }
        })(id));

        traverse.set(args, path, f);
    }

    for(var j = 0; j < links.length; j++){
        var link = links[j],
            val = traverse.get(args, link.from);

        traverse.set(args, link.to, val);
    }

    fn.apply(this, args);
}

/*
 * Creates an mrpc packets
 *
 * @param { Number || String } method
 * @param { Array } args
 *
 * @returns { Array } packet
 *
 * @api private
 */

mrpc.prototype.scrub = function(method, obj){
    var self = this,
        info = self.server.address(),
        port = info.port,
        host = info.address,
        links = [],
        cbs = {};

    var args = traverse(obj).map(function(node){
        if(typeof node === "function"){
            var hash = hashify(node);

            self.remote[hash] = node;
            cbs[hash] = this.path;

            this.update("[Fn]");
        }else if(this.circular){
            links.push({ from: this.circular.path, to : this.path });
            this.update("[Cr]");
        }
    });

    return [
        port,
        host,
        method,
        args,
        cbs,
        links
    ];
};

/*
 * Connects to another mrpc server.
 *
 * @param { Number } port
 * @param { String } host (optional)
 * @param { Function } cb
 *
 * If host is not set, it defaults to localhost.
 *
 * @returns { mrpc } self
 *
 * @api public
 */

mrpc.prototype.connect = function(port, host, cb){
    var self = this;

    if(cb == undefined){
        cb = host;
        host = null;
    }

    var fn = function(remote){
        self.emit("remote", remote);
        if(cb) cb(remote);
    }

    var obj = self.scrub("methods", [fn]);
    self.send(port, host, obj);

    return this;
}

/*
 * Listen for incoming connections.
 *
 * @param { Number } port
 * @param { String } host (optional)
 *
 * Wraps tcp.Server.listen().
 *
 * If host is not set, it defaults to localhost.
 *
 * @returns { mrpc } self
 *
 * @api public
 */

mrpc.prototype.listen = function(port, host, cb){
    var self = this;

    self.server.listen(port, host, function(){
        self.emit("listening");
        if(cb) cb();
    });

    return this;
};

/*
 * Sends messages to the specified destination.
 *
 * @param { Number } port
 * @param { String } host (optional)
 * @param { Object } obj
 *
 * If host is not set, it defaults to localhost.
 *
 * @api private
 */

mrpc.prototype.send = function(port, host, obj){
    var self = this;

    if(obj == undefined){
        obj = host;
        host = null;
    }

    var socket = net.connect(port, host, self.domain.bind(function(){
        socket.end(msgpack.pack(obj));
    }));
}

/*
 * Closes the server.
 *
 * @param { Function } cb (optional)
 *
 * Once the server has fully closed, the "end" event will be emitted and the
 * the callback will be executed.
 *
 * @api public
 */

mrpc.prototype.end = function(cb){
    var self = this;

    self.server.close(function(){
        self.emit("end");
        if(cb) cb();
    });
}

// Exports
module.exports = mrpc;
