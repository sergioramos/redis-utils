var rediis = require('redis-node'),
    cp = require('child_process'),
    regex = require('./regex'),
    redis = require('redis'),
    fs = require('fs')

/******************************* SERVER/CLIENT ********************************/


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

/********************************** SERVER ************************************/

module.exports.server = function (config, callback) {
  if(!config) config = {}
  var args = ensure(config, [])
  var rs = null
  var res = {kill: function () {
    rs.kill()
  }}

  var onRunning = function (e, running) {
    if(running) return callback()
    rs = spawn(args, callback)
  }

  var onConfig = function () {
    running(config, onRunning)
  }

  if(args.length > 0) parse(config, onConfig)
  else onConfig()

  return res
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
    rs.kill()
  })

  rs.stdout.on('data', function (data) {
    if(data.toString().match(regex)) callback(null)
  })

  process.on('exit', function () {
    rs.kill()
  })

  return rs
}

/********************************** CLIENT ************************************/

module.exports.client = function (config, callback) {
  var state = {
    ready: false,
    auth: false
  }

  var check = function () {
    if(config.auth && (state.ready && state.auth)) callback(client)
    else if(state.ready) callback(client)
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
    throw e
  })

  process.on('exit', function () {
    client.quit()
  })

  return client
}

/********************************** PUBSUB ************************************/

var parse_evs = function (evs) {
  if(typeof evs === 'string') {
    var ev = evs
    evs = [ev]
  }

  return evs
}

module.exports.pubsub = function (config, cbs, evs, callback) {
  evs = parse_evs(evs)

  var client = module.exports.client(config, function () {    
    client.on('message', function (channel, message) {
      if(cbs[channel]) cbs[channel](message)
    })

    evs.forEach(function (ev) {
      client.subscribe(ev)
    })

    process.on('exit', client.end)

    callback(null, client)
  })

  var unsubscribe = function (_evs) {
    if(_evs) _evs = parse_evs(_evs)

    var __evs = _evs || evs

    __evs.forEach(function (ev) {
      client.unsubscribe(ev)
    })
  }

  var end = function () {
    client.quit()
  }

  process.on('exit', end)

  return {
    unsubscribe: unsubscribe,
    end: end
  }
}

module.exports.pubsub.add = function (client, evs) {
  evs = parse_evs(evs)

  evs.forEach(function (ev) {
    client.subscribe(ev)
  })
}