function Player (serverId , id , playerName) {
    this.serverId = serverId;
    this.id = id;
    this.name = playerName;
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
var apple = new Player('ABC' , 1 , 'aryaman');
console.log(apple.getId()+"\n");
console.log(apple.getServerId());