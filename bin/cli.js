#!/usr/local/bin/node
'use strict';
var Cache  = require('../index.js')
var convar = require('convar')
var ttl    = convar('ttl') || 60
var namespace = convar('namespace')

function help(msg) {
  var pkg = require('../package.json')
  if (msg) {
    console.error(msg)
    console.log('')
  }
  console.error(pkg.name, '- v' + pkg.version)
  console.error(pkg.description)
  console.log('')
  console.error('Usage:', pkg.name,
    '--engines [memory,][file,][redis,][mongo] [--redis REDIS_CONFIG] [--mongo MONGO_CONFIG] [--namespace value] --op OPERATION --key KEY [--value value] [--ttl duration]'
  )
  console.error('REDIS_CONFIG: JSON or JSONIC parameters, ex: host:127.0.0.1,port:6379')
  console.error('MONGO_CONFIG: JSON or JSONIC parameters, ex: host:127.0.0.1,port:6379,collection:account')
  console.error('Operations: get, set, del, clear')
  console.log('')
  console.log('Example:', pkg.name, '--engines memory,file --op set --key test --value "Test Value"')
  console.log('        ', pkg.name, '--engines memory,file --op get --key test')
  process.exit(1)
}

var engines = convar('engines')
if (!engines) help('Missing engine(s)')
engines = engines.split(',')
for (var i=0; i<engines.length; i++) {
  var engine = engines[i]
  var options = convar(engine)
  if (options) {
    options.engine = engine
    engines[i] = options
  }
}

var options = {ttl: ttl}
if (namespace) options.namespace = namespace
var cache  = new Cache(options, engines)

var op = convar('op')
if (!op) help()
if (['get', 'set', 'del', 'clear'].indexOf(op) < 0) help('Bad operation: "' + op + '"')

var key = convar('key')
if (!key && op != 'clear') help('Missing --key')

var value = convar('value')
if (!value && op == 'set') help('Missing --value')

switch (op) {
  case 'get':
  cache.get(key, function(err, value) {
    if (err) help(err)
    console.log('Value:', value)
  })
  break;
  case 'set':
  cache.set(key, value, function(err) {
    if (err) help(err)
  })
  break;
  case 'del':
  cache.set(key, function(err) {
    if (err) help(err)
  })
  break;
  case 'clear':
  cache.set(function(err) {
    if (err) help(err)
  })
  break;
}
