var test = require("tap").test,
    mrpc = require("../");

test("empty", function(t){
    t.plan(3);
    var port = Math.floor(Math.random() * 40000 + 10000);

    var m = mrpc.listen(port),
        mm = mrpc.connect(port, function(remote){
            t.ok(remote.methods);
            t.ok(remote.prune);
            t.equal(2, Object.keys(remote).length);

            m.end();
            mm.end();

            t.end();
        });
});
