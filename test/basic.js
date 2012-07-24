var test = require("tap").test,
    mrpc = require("../");

test("basic", function(t){
    t.plan(1);

    var m = mrpc({
        test: function(obj){
            t.equal(obj.foo, "bar");

            m.end();
            mm.end();

            t.end();
        }
    }).listen(1337);

    var mm = mrpc.connect(1337, function(remote){
        remote.test({ foo: "bar" });
    });
});
