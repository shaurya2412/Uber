const http = require("http");
const app = require("./app");
const config = require("./config");

const server = http.createServer(app);
const { initializeSocket } = require("./services/socket.service");
initializeSocket(server);
server.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
    console.log(`MongoDB URI: ${config.MONGODB_URI}`);
});  