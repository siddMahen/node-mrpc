# mrpc [![Build Status](https://secure.travis-ci.org/siddMahen/node-mrpc.png?branch=master)](http://travis-ci.org/siddMahen/node-mrpc)

`mrpc` is an asynchronous RPC system designed with performance in mind. It is
fast, efficient and dead easy to understand and use.

For a complete overview of what `mrpc` does under the hood, see the
[`SPEC.md`](https://github.com/siddMahen/node-mrpc/blob/master/SPEC.md).

## Examples

For example, starting the following server:

```js
var mrpc = require("mrpc");

var server = mrpc({
    transform: function(s, cb){
        cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase());
    }
});

server.listen(5004);
```

And the following client:

```js
var mrpc = require("mrpc");

var m = mrpc.connect(5004, function(remote){
    remote.transform("beep", function(s){
        console.log("beep => " + s);
        m.end();
    });
});
```

Outputs:

```
$ node beep-server.js &
[1] 12163
$ node beep-client.js
beep => BOOP
```

## Installation

Using `npm`, do:

```
$ npm install mrpc
```

## Documentation

See the inline documentation as well as the examples in the
[`examples`](https://github.com/siddMahen/node-mrpc/blob/master/examples)
folder.

## License

(The MIT License)

Copyright (C) 2012 by Siddharth Mahendraker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
