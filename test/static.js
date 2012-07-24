var test = require("tap").test,
    mrpc = require("../");

test("static", function(t){
    t.plan(2);
    var port = Math.floor(Math.random() * 40000 + 10000);

    var m = mrpc({
        a: "bar",
        b: "baz"
    }).listen(port);

    var mm = mrpc.connect(port, function(remote){
        t.equal(remote.a, "bar");
        t.equal(remote.b, "baz");

        m.end();
        mm.end();
        t.end();
    });
});
