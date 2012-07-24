var test = require("tap").test,
    mrpc = require("../");

test("circular", function(t){
    t.plan(2);
    var port = Math.floor(Math.random() * 40000 + 10000);

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
    }).listen(port);

    var mm = mrpc.connect(port, function(remote){
        remote.circular(o);
    });
});
