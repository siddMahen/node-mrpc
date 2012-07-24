var test = require("tap").test,
    mrpc = require("../");

test("static", function(t){
    t.plan(2);

    var m = mrpc({
        a: "bar",
        b: "baz"
    }).listen(1337);

    var mm = mrpc.connect(1337, function(remote){
        t.equal(remote.a, "bar");
        t.equal(remote.b, "baz");

        m.end();
        mm.end();
        t.end();
    });
});
