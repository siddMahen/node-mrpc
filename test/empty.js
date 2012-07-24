var test = require("tap").test,
    mrpc = require("../");

test("empty", function(t){
    t.plan(3);

    var m = mrpc.listen(1337),
        mm = mrpc.connect(1337, function(remote){
            t.ok(remote.methods);
            t.ok(remote.prune);
            t.equal(2, Object.keys(remote).length);

            m.end();
            mm.end();

            t.end();
        });
});
