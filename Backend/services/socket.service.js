const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const redisClient = require("../db/redis");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.id}`);
    
    // Join a room based on the user's/captain's ID
    if (socket.user && socket.user._id) {
        socket.join(socket.user._id.toString());
        console.log(`User ${socket.user._id} joined their personal room.`);

        if (socket.user.role === 'captain' || socket.user.role === 'driver') {
            socket.join("captains");
            console.log(`Captain ${socket.user._id} joined captains room.`);
        }
    }

    socket.on("join_captains", () => {
        socket.join("captains");
        console.log(`Socket ${socket.id} explicitly joined captains room.`);
    });

    // Driver updating their live location every 3-5s
    socket.on("location:update", async (data) => {
      try {
        const { rideId, captainId, lat, lng, heading } = data;
        const driverId = captainId || (socket.user ? socket.user._id : 'unknown');

        if (lat && lng && redisClient && redisClient.isOpen) {
          // Store in Redis cache with 30s TTL
          await redisClient.setEx(
            `driver:${driverId}:location`,
            30,
            JSON.stringify({ lat, lng, heading: heading || 0, updatedAt: Date.now() })
          );

          // Add to Redis Geospatial index
          try {
            await redisClient.geoAdd("drivers:locations", {
              longitude: parseFloat(lng),
              latitude: parseFloat(lat),
              member: driverId.toString()
            });
          } catch (geoErr) {}
        }

        // Broadcast directly to the active ride room
        if (rideId) {
          io.to(rideId.toString()).emit("driver:location_updated", {
            rideId,
            driverId,
            lat,
            lng,
            heading: heading || 0
          });
        }
      } catch (err) {
        console.error("Error processing driver location:", err.message);
      }
    });

    socket.on("join_ride", (rideId) => {
      if (rideId) {
        socket.join(rideId.toString());
        console.log(`Socket ${socket.id} joined ride room ${rideId}`);
      }
    });

    socket.on("leave_ride", (rideId) => {
      if (rideId) {
        socket.leave(rideId.toString());
        console.log(`Socket ${socket.id} left ride room ${rideId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected from socket: ${socket.id}`);
    });
  });
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

// Push notification helper to a specific user
function emitToUser(userId, event, data) {
    if (io && userId) {
        io.to(userId.toString()).emit(event, data);
    }
}

// Broadcast ride status to both rider & driver and the ride room
function emitRideStatus(rideId, eventName, payload) {
  if (io && rideId) {
    io.emit(eventName, payload);
    io.to(rideId.toString()).emit(eventName, payload);
    io.to("captains").emit(eventName, payload);
    if (payload?.user?._id || payload?.user) {
      const uId = payload.user._id || payload.user;
      io.to(uId.toString()).emit(eventName, payload);
    }
    if (payload?.captain?._id || payload?.captain) {
      const cId = payload.captain._id || payload.captain;
      io.to(cId.toString()).emit(eventName, payload);
    }
  }
}

async function cacheDriverLocation(driverId, { lat, lng, heading = 0 }) {
  if (lat && lng && redisClient && redisClient.isOpen) {
    await redisClient.setEx(
      `driver:${driverId}:location`,
      30,
      JSON.stringify({ lat, lng, heading, updatedAt: Date.now() })
    );
    try {
      await redisClient.geoAdd("drivers:locations", {
        longitude: parseFloat(lng),
        latitude: parseFloat(lat),
        member: driverId.toString()
      });
    } catch (e) {}
  }
}

module.exports = {
  initializeSocket,
  getIo,
  emitToUser,
  emitRideStatus,
  cacheDriverLocation
};

