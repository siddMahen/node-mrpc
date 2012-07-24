var test = require("tap").test,
    mrpc = require("../");

test("basic", function(t){
    t.plan(1);
    var port = Math.floor(Math.random() * 40000 + 10000);

    var m = mrpc({
        test: function(obj){
            t.equal(obj.foo, "bar");

            m.end();
            mm.end();

            t.end();
        }
    }).listen(port);

    var mm = mrpc.connect(port, function(remote){
        remote.test({ foo: "bar" });
    });
});
