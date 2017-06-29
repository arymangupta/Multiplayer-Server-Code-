var io = require('socket.io');


function init() {
	// Create an empty array to store players
	players = [];

	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8000);
	console.log("Running..");
	// Configure Socket.IO
	socket.configure(function() {
		// Only use WebSockets
		socket.set("transports", ["websocket"]);

		// Restrict log output
		socket.set("log level", 2);
	});

	// Start listening for events
	setEventHandlers();
};

var setEventHandlers = function() {
	// Socket.IO
	socket.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
	console.log("New player has connected: "+client.id);
	this.emit("OnConnectedToServer" , client);
	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);
};


/**************************************************
** RUN THE GAME
**************************************************/
init();


/**************************************************
** PLAYER CLASS
**************************************************/
function Player (serverId , id , playerName) {
    this.serverId = serverId;
    this.id = id;
    this.name = playerName;
    this.designation = "-1";
    //functions
    this.getId = getPlayerId;
    this.getServerId = getPlayerServerId;
}
 
// anti-pattern! keep reading...
function getPlayerId() {
    return this.id;
}
function getPlayerServerId() {
    return this.serverId;
}