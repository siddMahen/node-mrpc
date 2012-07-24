var test = require("tap").test,
    mrpc = require("../");

test("basic functionality", function(t){
    t.plan(2);

    var m = mrpc({
        test: function(num, cb){
            cb(num + 10);
        }
    }).listen(1337);

    var mm = mrpc.connect(1337, function(remote){
        remote.test(10, function(total){
            t.ok(total);
            t.equal(total, 20);

            m.end();
            mm.end();

            t.end();
        });
    });
});
