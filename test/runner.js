var redis = require('../')({}, function () {
  console.log(arguments)
})

console.log(redis.kill);