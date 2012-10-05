var rediis = require('redis-node'),
    cp = require('child_process'),
    regex = require('./regex'),
    redis = require('redis'),
    fs = require('fs')

var defaults = {
  port: '6379',
  host: '127.0.0.1'
}

var ensure = function (config, args) {
  if(args && config.conf) args.push(config.conf)
  if(!config.host) config.host = defaults.host
  if(!config.port) config.port = defaults.port

  return args
}

var running = function (config, callback) {
  var client = rediis.createClient(config.port, config.host)

  if(config.password) client.auth(config.password)

  client.on('connected', function () {
    client.close()
    callback(null, true)
  })

  client.on('connection error', function () {
    client.close()
    callback(null, false)
  })
}

var parse = function (config, callback) {
  var onFile = function (e, data) {
    if(e) throw e

    var port = data.match(regex.port)
    var host = data.match(regex.host)

    if(port) config.port = port[1]
    if(host) config.host = host[1]

    callback()
  }

  fs.readFile(config.conf, 'utf8', onFile)
}

var spawn = function (args, callback) {
  var rs = cp.spawn('redis-server', args)

  rs.stderr.on('data', function (e) {
    callback(new Error(e.toString()))
  })

  rs.stdout.on('data', function (data) {
    if(data.toString().match(regex)) callback(null)
  })

  process.on('exit', rs.kill)
}

module.exports.server = function (config, callback) {
  var rs

  if(!config) config = {}
  var args = ensure(config, [])

  var onRunning = function (e, running) {
    if(running) return callback()
    spawn(args, callback)
  }

  var onConfig = function () {
    running(config, onRunning)
  }

  if(args.length > 0) return parse(config, onConfig)
  onConfig()
}

module.exports.client = function (config, callback) {
  var state = {
    ready: false,
    auth: false
  }

  var check = function () {
    if(config.auth && (state.ready && state.auth)) callback()
    else if(state.ready) callback()
  }

  if(!config) config = {}
  ensure(config)

  var client = redis.createClient(config.port, config.host)

  if(config.auth) client.auth(config.auth.pass, function () {
    state.auth = true
    check()
  })

  client.on('ready', function () {
    state.ready = true
    check()
  })

  client.on('error', function (e) {
    callback(e)
  })

  return client
}