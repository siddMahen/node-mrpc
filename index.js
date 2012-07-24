var mrpc = require("./lib/mrpc.js");

// Exports
exports = module.exports = mrpc;

/*
 * Creates a connection without a constructor.
 *
 * @param { Number } port
 * @param { String } host (optional)
 * @param { Function } cb (optional)
 *
 * @returns { mrpc } server
 *
 * @api public
 */

exports.connect = function(port, host, cb){
    return mrpc().listen(0).connect(port, host, cb);
}

/*
 * Creates a mrpc server without a connection or a constructor.
 *
 * @param { Number } port
 * @param { String } host (optional)
 * @param { Function } cb (optional)
 *
 * @returns { mrpc } server
 *
 * @api public
 */

exports.listen = function(port, host, cb){
    return mrpc().listen(port, host, cb);
}
