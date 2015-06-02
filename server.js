var static = require('node-static');
var http = require('http');

// Create a node-static server instance
var file = new(static.Server)();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8181;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var app = http.createServer(function (req, res) {
	file.serve(req, res);
}).listen(server_port, server_ip_address);

// Use socket.io JavaScript library for real-time web applications
var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket){
	// Handle 'message' messages
	socket.on('message', function (message) {
		console.log(message);
		log('S --> got message: ', message.channel);
		socket.broadcast.to(message.channel).emit('message', message.message);
});

// Handle 'create or join' messages
socket.on('create or join', function (room) {
	var clients = io.sockets.adapter.rooms[room];
	var numClients = 0;
	//console.log(clients);
	for (var clientId in clients) {
 		numClients++;
	}
	console.log(numClients);
	
	log('S --> Room ' + room + ' has ' + clients + ' client(s)');
	log('S --> Request to create or join room', room);
	
	if (numClients == 0){
		socket.join(room);
		socket.emit('created', room);
	}
	else if (numClients == 1) {
		io.sockets.in(room).emit('join', room);
		socket.join(room);
		socket.emit('joined', room);
	}
	else {
		socket.emit('full', room);
	}
});

function log(){
	var array = [">>> "];
	for (var i = 0; i < arguments.length; i++) {
		array.push(arguments[i]);
	}
	socket.emit('log', array);
}
});
