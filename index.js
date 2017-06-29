

var io = require('socket.io');
var players;
var idProvider = 1;
var maxRoomEntry = 4;
var designationList = ["0","1","2","3"];
var roomList;
function init() {
	// Create an empty array to store players
	players = [];

	// Set up Socket.IO to listen on port 8000
	io = io.listen(8000);
	console.log("Running..");

	// Configure Socket.IO
	

	// Start listening for events
	setEventHandlers();
};
var setEventHandlers = function() {
	// Socket.IO
	io.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
	console.log("New player has connected: "+client.id);

	this.emit("OnConnectedToServer");

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);

	// Listen for CreateRoom message
	client.on("CreateRoom", onCreateRoom);

	// Listen for JoinRoom message
	client.on("JoinRoom", onJoinRoom);

	// Listen for LeaveRoom message
	client.on("LeaveRoom", onLeaveRoom);

	// Listen for move player message
	client.on("OnPlayerMove", OnPlayerMove);

	// Listen for player message
	client.on("OnChatMessage", OnMessage);
};
// Socket client has disconnected
function onClientDisconnect() {
	
	console.log("Player has disconnected:");
	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+this.id);
		return;
	};
	this.emit("OnPlayerDisconnected", {id: removePlayer.id}); /*DEBUG*/
	// Broadcast removed player to connected socket clients
	this.broadcast.emit("OnPlayerDisconnected", {id: removePlayer.id});


	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);
};

// New player has joined
function onNewPlayer(data) 
{

	console.log("New user");
	var newPlayer = new Player(this.id , idProvider , data.name , data.roomName);
	idProvider++;
	console.log(newPlayer.id+" "+newPlayer.name);
	this.emit("new player", {id: newPlayer.id, name: newPlayer.name});/*DEBUG*/
	// Broadcast new player to connected socket clients
	this.broadcast.to(data.roomName).emit("new player", {id: newPlayer.id, name: newPlayer.name});

	
	var roomCounter=1;
	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		if(existingPlayer.roomName == data.roomName){
			this.emit("new player", {id: existingPlayer.id, name: existingPlayer.name});
			roomCounter++;
		}	
	};

	// Add new player to the players array
	players.push(newPlayer);

	if(roomCounter==maxRoomEntry)
	{
		//Start Game  give time of 5 seconds so that designation arrive to all player
		this.emit("StartGame"); 
		this.broadcast.to(data.roomName).emit("StartGame");


		var index = 0;
		for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		if(existingPlayer.roomName == data.roomName){
			this.emit("OnPlayerDesignation", {id: existingPlayer.id, designation: designationList[index]});
			this.broadcast.to(data.roomName).emit("OnPlayerDesignation" , {id: existingPlayer.id, designation: designationList[index]});
			index++;
		}	
	};
	}
};

// Player has moved
function OnPlayerMove(data) {

	this.emit("OnPlayerResult" , {answer: data.answer});
	this.broadcast.to(data.roomName).emit("OnPlayerResult" , {answer: data.answer});

	//Start Game Again give time of 5 seconds so that designation arrive to all player
	this.emit("StartGame"); 
	this.broadcast.to(data.roomName).emit("StartGame");

 		var index = 0;
		for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		if(existingPlayer.roomName == data.roomName){
			this.emit("OnPlayerDesignation", {id: existingPlayer.id, designation: designationList[index]});
			this.broadcast.to(data.roomName).emit("OnPlayerDesignation" , {id: existingPlayer.id, designation: designationList[index]});
			index++;
		}	
	};


};
// Player has created a room
function onCreateRoom(data) 
{
	if(roomMembersCount(data)){
		this.join(data.roomName);
		this.emit("OnRoomCreated" , {roomName: data.roomName});
	}
	else 
	{
			this.emit("OnJoinedRoomFailed");
	}
};
// Player has joined a room
function onJoinRoom(data) 
{
		if(roomMembersCount(data)){
		this.join(data.roomName);
		this.emit("OnJoinedRoom" , {roomName: data.roomName});
		}
		else {
			this.emit("OnJoinedRoomFailed");
		}
};
// Player has left a room
function onLeaveRoom(data) {

	this.leave(data.roomName);
	// Broadcast player left to connected socket clients
		newPlayer = playerById(this.id);
		if(newPlayer)
		this.broadcast.emit("OnLeaveRoom", {id: newPlayer.id});
		else
		{
			//error
		}
};
function OnMessage (data) {

	var player = playerById(this.id);
	if(player)
	{
		if(data.roomName == "default"){
			this.broadcast.emit("OnChatMessage" , {name:player.name , message: data.message});
		}else
		{
			this.emit("OnChatMessage" , {name:player.name , message: data.message});
			this.broadcast.to(data.roomName).emit("OnChatMessage" , {name:player.name ,  message: data.message});
		}
	}
}


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].serverId == id)
			return players[i];
	};
	
	return false;
};

function roomMembersCount(room) {
	var roomMembers = 0;
    for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		if(existingPlayer.roomName == room.roomName){
			roomMembers++;
		}
	}
	console.log("Len "+roomMembers);
    return (roomMembers<maxRoomEntry);
}



/**************************************************
** RUN THE GAME
**************************************************/
init();

/**************************************************
** PLAYER CLASS
**************************************************/
function Player (serverId , id , playerName , roomName) {
    this.serverId = serverId;
    this.id = id;
    this.roomName = roomName;
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