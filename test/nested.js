var test = require("tap").test,
    mrpc = require("../");

test("nested", function(t){
    var m = mrpc({
        repeat: function(count, fn, cb){
            for(var j = 0; j < count; j++){
                fn();
            }

            cb(j);
        }
    }).listen(1337);

    var mm = mrpc.connect(1337, function(remote){
        var i = 0,
            inc = function(){ i++ };

        remote.repeat(5, inc, function(j){
            setTimeout(function(){
                t.equal(j, 5, "we've done 5 loops");
                // Here we have to wait for all the callbacks to have been
                // sent which is why we have a 1 sec wait.
                t.equal(i, 5, "now i == 5");

                m.end();
                mm.end();

                t.end();
            }, 1000);
        });
    });
});
