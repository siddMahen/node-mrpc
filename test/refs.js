var test = require("tap").test,
    mrpc = require("../");

test("refs", function(t){
    t.plan(2);
    var port = Math.floor(Math.random() * 40000 + 10000);

    var m = mrpc({
        test: function(cb){ cb() }
    }).listen(port);

    var mm = mrpc.connect(port, function(remote){
        remote.test(function(){ /*gc()*/ });
    });

    setTimeout(function(){
        // make sure that the mrpc objects are getting rid
        // of unreferenced functions
        t.equal(Object.keys(m.remote).length, 0, "# todo");
        t.equal(Object.keys(mm.remote).length, 0, "# todo");
        // wait for node-tap to accept --expose-gc

        m.end();
        mm.end();
        t.end();
    }, 1000);
});
