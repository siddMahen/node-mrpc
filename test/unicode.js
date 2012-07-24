var test = require('tap').test,
    mrpc = require('../');

test('unicode', function(t){
    t.plan(1);
    var port = Math.floor(Math.random() * 40000 + 10000);

    var m = mrpc({
        unicode: function(cb){
            cb("☔☔☔☁☼☁❄");
        }
    }).listen(port);

    var mm = mrpc.connect(port, function(remote){
        remote.unicode(function(str){
            t.equal(str, "☔☔☔☁☼☁❄");

            m.end();
            mm.end();

            t.end();
        });
    });
});

