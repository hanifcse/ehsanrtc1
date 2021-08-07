const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// uuid means Universally Unique Identifier. It provide the universal unique identifier.
const { v4: uuid } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/peerjs", peerServer);
app.get("/", (req, res) => {
  res.redirect(`${uuid()}`);
  // console.log(req.query);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
  console.log("Passcode: ", req.query);
});



// new code for query string
// app.get("/:room", (req, res) => {
//   res.render("room", { roomId: req.params.room });
//   console.log("New Password: ", req.query);
// })


// 

// new code
// io.on("connection", (socket) => {
//   socket.leave("room 237");

//   io.to("room 237").emit(`user ${socket.id} has left the room`);
// });
// 

// join the room
io.on("connection", (socket) => {
  console.log("New user connected!!");
  // console.log(io.sockets.sockets);

  // show total participant
  let totalParticipant = io.engine.clientsCount;
  socket.emit('participant', totalParticipant);

  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
      console.log("Message: ", message);
    });

    // New code for user start
    socket.on("userName", (uname) => {
      io.to(roomId).emit("userName", uname);
      console.log("UserName: ", uname);
    });

    // New code for user end

  });
  console.log("object========================================================================");
  socket.on("disconnect", function () {
    console.log("user disconnected!");
  })

  // socket.on('disconnect', () => {
  //   socket.to(roomId).broadcast.emit('user-disconnected', userId)
  // })

  // setTimeout(function () {
  //   // socket.send("Hello Hanif I am Robot!!");

  //   // io.sockets.sockets[socket.id].disconnect();
  //   // console.log("Hello Ehsan Software");

  //   if (io.sockets.sockets[socket.id]) {
  //     console.log("Before disconnecting message");
  //     // console.log("Hello Hanif", io.sockets.sockets[socket.id]);
  //     io.sockets.sockets[socket.id].disconnect();
  //     console.log("Disconnected successfully again2!");
  //     // return socket;
  //     // window.location.reload(true);
  //   }
  // }, 10000)

  // socket.on("disconnect", function() {
  //   emitVisitors();
  //   console.log("user disconnected");
  // });

  // 
  // socket.leave("room 237");

  // io.to("room 237").emit(`user ${socket.id} has left the room`);

  // console.log("socket ID ",socket.id);

  // New


  // socket.on("disconnect", (discon) => {
  //   if (discon == 1) {
  //     if (io.sockets.sockets[socket.id]) {
  //       console.log("Before disconnecting message");
  //       console.log("Hello Hanif", io.sockets.sockets[socket.id]);
  //       // io.sockets.sockets[socket.id].disconnect();
  //       console.log("Disconnected successfully!");
  //     }

  //   }

  // });

  // if (io.sockets.sockets[socket.id]) {
  //   console.log("Before disconnecting message");
  //   console.log("Hello Hanif", io.sockets.sockets[socket.id]);
  //   // io.sockets.sockets[socket.id].disconnect();
  //   console.log("Disconnected successfully!");
  // }



});



server.listen(process.env.PORT || 3030);