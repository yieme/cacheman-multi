/** Multi-tiered cacheman caches
 *
 *  @copyright  Copyright (C) 2015 by yieme
 *  @module     cacheman-multi
 */
'use strict';
var _             = require('lodash')
var Cacheman      = require('cacheman')
var engineList    = ['memory', 'file', 'redis', 'mongo']


function CachemanMultiError(message) {
  /*jshint validthis: true */
  this.constructor.prototype.__proto__ = Error.prototype
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
}


function getConfig(option1, option2, option3) {
  var nameSpace
  var options = {}
  if (typeof option1 === 'string') {
    nameSpace = option1
    option1 = option2
    option2 = option3
  }
  if (typeof option1 === 'object' && !Array.isArray(option1)) {
    options = option1
    option1 = option2
  }
  options.nameSpace = nameSpace
//  console.log('getConfig:', typeof option1, option1)
  options.engines   =  Array.isArray(option1) ? option1 : ['memory']
  return options
}



function buildEngine(options) {
//  console.log('buildEngine options:', options)
  if (typeof options === 'string') {
    options = { engine: options }
  }
  options = options || {}
  options.engine = options.engine || 'memory'
  if (options.engine == 'redis' || options.engine == 'mongo') {
    options.engine.host = options.engine.host || '127.0.0.1'
  }
  if (options.engine == 'redis') options.engine.port = options.engine.port || 6379
  if (options.engine == 'mongo') options.engine.port = options.engine.port || 27017
//  console.log('engineList:', engineList)
//  console.log('engine:', options.engine)
  if (engineList.indexOf(options.engine) < 0) {
    throw new CachemanMultiError('Unknown cacheman-multi engine: "' + options.engine + '"')
  }

  var namespace = options.namespace
  options.namespace = null
  if (!namespace) {
    namespace = options
    options   = null
  }

  return new Cacheman(namespace, options)
}



function buildEngines(config) {
//  console.log('buildEngines config:', config)
  var result = []
  var engines = config.engines
//  console.log('engines:', engines)
  if (engines.length == 0) {
    engines = ['memory']
  }
//  console.log('engines:', engines)
  for (var i = 0, len=engines.length; i < len; i++) {
    var options = _.defaults(engines[i], config.options)
    var engine = buildEngine(options)
    result.push(engine)
  }
  return result
}



function cachemanMulti(option1, option2, option3) {
  /*jshint validthis: true */
  var self     = this
//  console.log('options:', option1, option2, option3)
  self.config  = getConfig(option1, option2, option3)
  console.log('config:', self.config)
  self.engines = buildEngines(self.config)
  self.engineCount = self.engines.length
//  console.log('engines count:', self.engineCount)

  function doCallback(err, value, param1, param2) {
    if (typeof param1 === 'function') {
      param1(err, value)
    } else if (typeof param2 === 'function') {
      param2(err, value)
    } else {
      console.log('No Callback')
    }
  }

  function doGet(iteration, key, callback) {
    iteration++
    console.log('iteration:', iteration)
    if (iteration >= self.engineCount) {
      doCallback(null, undefined, callback)
    } else {
      var engine = self.engines[iteration]
      engine.get(key, function nextGet(err, value) {
        console.log('nextGet:', key, err, value, typeof value, JSON.stringify(value))
        if (err) {
          doCallback(err, undefined, callback) // TODO: gracefully fallback
        } else if (value === null || value === undefined) {
          doGet(iteration, key, callback)
        } else {
          doCallback(null, value, callback)
        }
      })
    }
  }

  function set(key, value, ttl, callback) {
    console.log('set:', key, value)
    function handleError(err) {
      if (err) callback(err)
    }
    for (var i=0, len = self.engineCount; i < len; i++) {
      console.log('i:', i)
      var engine = self.engines[i]
      if (typeof ttl === 'function') {
        engine.set(key, value, handleError)
      } else {
        engine.set(key, value, ttl, handleError)
      }
    }
    doCallback(null, undefined, ttl, callback)
  }

  function doOp(op, key, callback) {
    function handleError(err) {
      if (err) callback(err)
    }
    for (var i=0, len = self.engineCount; i < len; i++) {
      var engine = self.engines[i]
      engine[op](key, handleError)
    }
    doCallback(null, undefined, callback)
  }

  self.set   = set
  self.get   = function get(key, callback) { doGet(-1,     key, callback) }
  self.del   = function del(key, callback) { doOp('del',   key, callback) }
  self.clear = function del(key, callback) { doOp('clear', key, callback) }

  return self
}



module.exports = cachemanMulti
