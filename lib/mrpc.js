var events = require("eventemitter2"),
    traverse = require("traverse"),
    msgpack = require("msgpack3"),
    hashify = require("hashify"),
    util = require("util"),
    net = require("net");

var slice = Array.prototype.slice;

/*
 * Creates an instance of mrpc.
 *
 * @param { Object } fns
 *
 * The fns parameter should be a map of functions.
 *
 * @api public
 */

var mrpc = function(fns){
    if(!(this instanceof mrpc))
        return new mrpc(fns);

    fns = fns || {};

    var self = this;

    events.EventEmitter2.call(this);

    this.server = net.createServer(function(socket){
        var buffs = [], size = 0;

        socket.on("data", function(data){
            if(typeof data === "string"){
                size +=  Buffer.byteLength(data);
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
    });

    this.local = fns;
    this.local["methods"] = function(cb){
        cb(self.local);
    };

    this.remote = {};
}

// Inherits from EventEmitter2.
util.inherits(mrpc, events.EventEmitter2);

/*
 * Handles incoming data.
 *
 * @param { Array } data
 *
 * The data array should be composed of 5 pieces in the following order:
 *
 * - The sender's port                             { Number }
 * - The sender's host address                     { String }
 * - The name or id of the function to be executed { Number || String }
 * - The arguments to the previous function        { Array }
 * - The map of callbacks for the arguments        { Object }
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

        traverse.set(args, path, f);
    }

    fn.apply(this, args);
}

/*
 * Creates mrpc packets
 *
 * @param { Number || String } method
 * @param { Array } args
 *
 * @api private
 */

mrpc.prototype.scrub = function(method, obj){
    var self = this,
        info = self.server.address(),
        port = info.port,
        host = info.address,
        cbs = {};

    var args = traverse(obj).map(function(node){
        if(typeof node === "function"){
            var hash = hashify(node);

            // The ordering of the functions inside
            // the cbs seems to mess things up
            self.remote[hash] = node;
            cbs[hash] = this.path;

            // replace with a smaller value later
            this.update("[Fn]");
        }
    });

    return [
        port,
        host,
        method,
        args,
        cbs
    ];
};

/*
 * Connect to a remote/local mrpc server.
 *
 * @param { Number } port
 * @param { String } host
 * @param { Function } cb
 *
 * @api public
 */

mrpc.prototype.connect = function(port, host, cb){
    var self = this;

    if(cb == undefined){
        cb = host;
        host = null;
    }

    var obj = self.scrub("methods", [cb]);
    self.send(port, host, obj);
}

/*
 * Listen for incoming connections.
 *
 * @param { Number } port
 * @param { String } host
 *
 * Wraps tcp.Server.listen().
 *
 * Emits a "ready" event when ready; ergo, once the server is listening.
 *
 * @api public
 */

mrpc.prototype.listen = function(port, host){
    var self = this;

    this.server.listen(port, host, function(){
        self.emit("ready");
    });

    return this;
};

/*
 * Sends messages to the specified destination
 *
 * @param { Number } port
 * @param { String } host
 * @param { Object } obj
 *
 * @api private
 */

mrpc.prototype.send = function(port, host, obj){
    if(obj == undefined){
        obj = host;
        host = null;
    }

    var socket = net.connect(port, host, function(){
        socket.end(msgpack.pack(obj));
    });

    return this;
}

/*
 * Closes the server.
 *
 * @param { Function } cb (optional)
 *
 * The callback will fire once the server has been closed properly.
 *
 * Also emits a "close" event.
 *
 * @api public
 */

mrpc.prototype.close = function(cb){
    var self = this;

    this.server.close(function(){
        self.emit("close");
        if(cb) cb();
    });
}

// Exports
module.exports = mrpc;
