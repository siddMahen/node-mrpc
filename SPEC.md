# mrpc Specification

`mrpc` is a asynchronous RPC system designed with performance in mind. It is
based loosely on the `MessagePackRPC` and `dnode` protocols.

## Goals

* Fast
* Memory and bandwidth efficient
* Simple
* Drop in replacement for `dnode` (for the most part)

## Design

1. The client will request a list of methods from the server. This will be
accomplished by sending the server a request to execute the "methods" method.
This method is universal to all mrpc servers. The method will accept a callback
which will in turn send the data back to the client.

2. The server will send a map of the following form through the callback:

```js
{
  "foo": 1234,
  "bar": 6789,
  "baz": 7514
}
```

Where each entry represents a function and it's associated unique
identification number.

3. The client will receive the list and create a shim for each function.
The shim will notify the server once the function has been called on the
client side by sending the function id. The shim will also recursively
check it's arguments at runtime to determine if they contain any functions,
and if so, add these functions to the local function map (the client function
map).

4. Once the shims have been created and setup to ping the server back, the
client is free to call any of the server's remote methods, by sending it
function execution requests of the form:

```js
[
  port, // Sender's port
  host, // Sender's host
  id/method,
  arguments, // Arguments stripped of functions
  callbacks // Map of function ids and their respective locations in the args
]
```

5. The server will receive the packed arguments and proceed to execute the
function specified. The arguments array will be filled in with the appropriate
shims as was done in step 3; such that calling any functions in the arguments
invokes the proper remote call.
