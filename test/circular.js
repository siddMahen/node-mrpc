var test = require("tap").test,
    mrpc = require("../");

test("circular", function(t){
    t.plan(2);

    var o = {
        name: "Jeff",
        ref: null
    };

    o.ref = o;

    var m = mrpc({
        circular: function(obj){
            t.ok(obj.ref);
            t.equal(obj.ref.name, o.name);

            m.end();
            mm.end();

            t.end();
        }
    }).listen(1337);

    var mm = mrpc.connect(1337, function(remote){
        remote.circular(o);
    });
});
