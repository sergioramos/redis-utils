var spawn = require('child_process').spawn,
    regex = require('./regex'),
    redis = require('redis')

module.exports = function (config, callback) {
  var state = {
    running: false,
    ready: false,
    auth: false
  }
  
  var args = [],
      client, rs
  
  var check = function () {
    if(config.auth && (state.running && state.ready && state.auth)) callback()
    else if(state.running && state.ready) callback()
  }
  
  var kill = function () {
    rs.kill()
    client.end()
  }
  
  if(!config) config = {}
  if(config.conf) args.push(config.conf)
  
  rs = spawn('redis-server', args)
  client = redis.createClient(config.host || null, config.port || null)
  
  client.kill = kill
  
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
  
  rs.stderr.on('data', function (e) {
    console.log('dataerror', e);
    callback(new Error(e.toString()))
  })
  
  rs.stdout.on('data', function (data) {
    if(data.toString().match(regex)) {
      state.running = true
      check()
    }
  })
  
  process.on('exit', kill)
    
  return client
}

