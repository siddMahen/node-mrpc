var test = require('tap').test,
    mrpc = require('../');

test('unicode', function(t){
    t.plan(1);

    var m = mrpc({
        unicode: function(cb){
            cb("☔☔☔☁☼☁❄");
        }
    }).listen(1337);

    var mm = mrpc.connect(1337, function(remote){
        remote.unicode(function(str){
            t.equal(str, "☔☔☔☁☼☁❄");

            m.end();
            mm.end();

            t.end();
        });
    });
});

