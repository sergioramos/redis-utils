# redis-utils

## install

```bash
npm install redis-utils
```

## api

```js
var ru = require('redis-utils')
```

### server(config, callback)

```js
ru.server({
  host: '127.0.0.1',
  port: 6379,
  password: 'root'
}, function (e) {
  if(e) throw e
  console.log('redis server is running')
})
```


 * If the `redis-server` is already running in the specified port and host it will not spawn a new process.
 * When the process exits, the `redis-server` will also exit - unless it was already running.
 * The password is used to connect the server in order to ensure it is running.

Alternatively you can pass the `redis.conf` path in the opts.

```js
ru.server({
  conf: 'path/to/redis.conf'
})
```

### client(config, callback)

The config options are the same as `.server()`

```js
ru.client({
  host: '127.0.0.1',
  port: 6379
}, function (e, client) {
  if(e) throw e
})
```

### pubsub(config, cbs, evs, callback)

```js

var on = {
  ev1: function (message) {},
  ev2: function (message) {}
}


ru.pubsub({
  host: '127.0.0.1',
  port: 6379
}, on, ['ev2', 'ev2'])
```

## license
    Copyright (C) 2012 Sérgio Ramos <mail@sergioramos.me>

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
    documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
    persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
    Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.