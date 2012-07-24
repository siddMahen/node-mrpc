var mrpc = require("../");

var server = mrpc({
    transform: function(s, cb){
        cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase());
    }
});

server.listen(5004);
