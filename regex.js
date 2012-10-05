module.exports.running = /\[\d*\] \d{2} .*? \d{2}:\d{2}:\d{2} \* The server is now ready to accept connections on port \d*/
module.exports.host = /^bind (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/im
module.exports.port = /^port (\d{1,5})$/im