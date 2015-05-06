# cacheman-multi

Multi-tiered cacheman cache

## Installation

This module is installed via npm:

```sh
npm i cacheman-multi --save
```

## Example Usage

```js
var Cache = require('cacheman-multi')
var cache = new Cache(); // in-memory lru cache

// or namespaced cache
var cache = new Cache('todo'); // in memory default

// or with options
var cache = new Cache({ ttl: 90 });

// or namespaced with options
var cache = new Cache('todo', { ttl: 90 });

// or namespaced with a list of engines in the order they will be used
var cache = new Cache('todo', [
  { engine: 'memory', ttl: 60}, // in memory, 1 minute TTL
  { engine: 'redis',  ttl: 3600, port: 6379  /* default */, host: '127.0.0.1' /* default */}, // redis, 1 hour TTL
  { engine: 'mongo',  ttl: 3600, port: 27017 /* default */, host: '127.0.0.1' /* default */, username: 'usr', password: 'PaS$', database: 'my-cache-db', collection: 'my-collection', compression: false /* default */} // mongo 1 day TTL
]);

// or a quick memory and redis cache
var cache = new Cache(
  [ 'memory',
  { engine: 'redis', ttl: 600 }
]);

// or a quick memory and mongo cache
var cache = new Cache([
  'memory',
  { engine: 'mongo', url:'mongodb://127.0.0.1:27017/blog', collection: 'account', ttl: 600 }
]);

// or engines with different namespaces
var cache = new Cache([
  { engine: 'memory', namespace: 'foo' },
  { engine: 'file',   namespace: 'bar'}
]);

// set the value
cache.set('my key', { foo: 'bar' }, function (error) {
  if (error) throw error;

  // get the value
  cache.get('my key', function (error, value) {
    if (error) throw error;

    console.log(value); //-> {foo:"bar"}

    // delete entry
    cache.del('my key', function (error){
      if (error) throw error;

      console.log('value deleted');
    });
  });
});
```

## Built on

And includes for convenience

- [x] [cacheman](https://www.npmjs.com/package/cacheman)
- [x] [cacheman-redis](https://www.npmjs.com/package/cacheman-redis)
- [x] [cacheman-mongo](https://www.npmjs.com/package/cacheman-mongo)
- [x] [cacheman-file](https://www.npmjs.com/package/cacheman-file)

## Cacheman supported functions, so far

- [x] get
- [x] set
- [x] del
- [x] clear
- [ ] use
- [ ] wrap

## CLI

Install

```sh
npm i cacheman-multi -g
```

Use

```sh
cacheman-multi --help
```

## Rights

Copyright (C) 2015 by yieme, License: MIT
