var mrpc = require("./lib/mrpc.js");

exports = module.exports = mrpc;

// TODO: Pretty obvious, but document me anyways
exports.connect = function(port, host, cb){
    var m = mrpc().listen(0).on("ready", function(){
        m.connect(port, host, cb);
    });
}
