var mrpc = require("../");

var m = mrpc.connect(5004, function(remote){
    remote.transform("beep", function(s){
        console.log("beep => " + s);
        m.end();
    });
});
