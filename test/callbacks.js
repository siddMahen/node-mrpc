var test = require("tap").test,
    mrpc = require("../");

test("basic functionality", function(t){
    t.plan(2);
    var port = Math.floor(Math.random() * 40000 + 10000);

    var m = mrpc({
        test: function(num, cb){
            cb(num + 10);
        }
    }).listen(port);

    var mm = mrpc.connect(port, function(remote){
        remote.test(10, function(total){
            t.ok(total);
            t.equal(total, 20);

            m.end();
            mm.end();

            t.end();
        });
    });
});
