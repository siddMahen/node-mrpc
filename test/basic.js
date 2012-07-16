var mrpc = require("../");

var m = mrpc({
    test: function(){
        console.log("Passed");
        process.exit(0)
    }
});

m.on("ready", function(){
    mrpc.connect(8000, function(remote){
        remote.test();
    });
});

m.listen(8000);
