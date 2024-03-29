var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

//router
var LocationRouter = require("./routes/api/main");

//server
var debug = require("debug")("server:server");
var http = require("http");
var port = normalizePort(process.env.PORT || "4000");

//socketIO
var socketIO = require("socket.io");

//db
var db = require("./routes/db/connect");

var app = express();

/// BUG1: fix bug lỗi Access-Control-Allow-Origin khi client get api của server vì thiếu cors header
var cors = require("cors");
app.use(cors());
/// end BUG1.

app.set("port", port);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", LocationRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//create server
var server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
var io = socketIO(server);

//hanle socketIO server-client
let interval;
var arrUser = [];
var arrDriver = [];
io.on("connection", socket => {
  //connect
  console.log(socket.id + " client connected");

  //push array user client.
  var obj = { idacc: "", role: "", idsocket: "" };
  obj.idsocket = socket.id;
  arrUser.push(obj);

  // handle event check id account , role , socketid
  socket.on("sendrole", data => {
    // console.log(data) // data: id, role
    arrUser.forEach(item => {
      if (item.idsocket == socket.id) {
        item.idacc = data.id;
        item.role = data.role;
        // break;
      }
    });
    console.log(arrUser);
    socket.emit("sendid", socket.id);
  });


  socket.on("datxe", data => {
    // console.log(data);
    const idsocket = data.id_Socket;
    console.log("dat xe ne");
    var flag = 0;
    // console.log(arrUser);
    arrUser.forEach(item => {
      if (item.idsocket == idsocket) {
        flag = 1;
        console.log("da gan cờ");
      }
    });

    if (flag === 0) {
      socket.emit("phanhoidatxe", "!!!!!!!!!!!!!!!");
      
    } else if (flag === 1) {
      // var datasend = { idTaiXe: data.taixeID, idkhach: data.userID };
      io.emit(data.taixeID, data);
    }

  });




  socket.on("nhanchuyen", async data => {
    console.log("nhanchuyen");

    console.log(data);

    io.emit(data.id, data.mess);
    //
    if (data.diadiemden_X != null) diadiemden_X = data.diadiemden_X; else diadiemden_X = null;
    if (data.diadiemden_Y != null) diadiemden_Y = data.diadiemden_Y; else diadiemden_Y = null;
    if (data.diadiemden_X != null) diadiemdon_X = data.diadiemden_X; else diadiemdon_X = null;
    if (data.diadiemdon_Y != null) diadiemdon_Y = data.diadiemdon_Y; else diadiemdon_Y = null;
    if (data.taixeID != null) taixeID = data.taixeID; else taixeID = null;
    if (data.userID != null) userID = data.userID; else userID = null;
    // if (data.date != null) date = data.date; else date = null;
    if (data.tongtien != null) tongtien = data.tongtien; else tongtien = null;
    if (data.sokm != null) sokm = data.sokm; else sokm = null;
    if (data.sophut != null) sophut = data.sophut; else sophut = null;
    status = "Chưa hoàn thành";
    var obj = {
      diadiemden_X: diadiemden_X,
      diadiemden_Y: diadiemden_Y,
      diadiemdon_X: diadiemdon_X,
      diadiemdon_Y: diadiemdon_Y,
      taixeID: taixeID,
      userID: userID,
      // date: date,
      tongtien: tongtien,
      sokm: sokm,
      sophut: sophut,
      status: status
    };
    await db.Trips.create(obj);
  });



  //kết thúc chuyến
  socket.on("ketthucchuyen", async data => {
    console.log("kethucchuyen");
    // var obj = {
    //   "diadiemden_X": data.diadiemden_X +"",
    //   "diadiemdon_X": data.diadiemdon_X+"",
    //   "diadiemden_Y": data.diadiemden_Y+"",
    //   "diadiemdon_Y": data.diadiemdon_Y+"",
    //   "taixeID": data.taixeID+"",
    //   "userID": data.userID+"",
    //   // date: data.date
    // };
    console.log(obj);
    var ddden_X= data.diadiemden_X +""
    var dddon_X = data.diadiemdon_X+""

    var ddden_Y= data.diadiemden_Y +""
    var dddon_Y = data.diadiemdon_Y+""


   await db.Trips.findOne({
     diadiemden_X:ddden_X,
    //  diadiemdon_X:dddon_X,
    //  diadiemden_Y:ddden_Y,
    //  diadiemdon_Y:dddon_Y
  },  async (err,rs)=>{
    rs.status = "Hoàn thành";
  await  rs.save(function (err, rs) {
      if (err) {
        console.log(err);
        io.emit(data.userID, { mess: data, ketthucchuyen: "fail" });
        io.emit(data.taixeID, { mess: data, ketthucchuyen: "fail" });
      } else {
        io.emit(data.userID, { mess: data, ketthucchuyen: "success" ,success:"true"});
        io.emit(data.taixeID, { mess: data, ketthucchuyen: "success" ,success:"true"});
      }
    });
    console.log(rs)
    })


    // if (err) {
    //   console.log(err);
    //   io.emit(data.userID, { mess: data, ketthucchuyen: "fail" });
    //   io.emit(data.taixeID, { mess: data, ketthucchuyen: "fail" });
    // } else {
    //   io.emit(data.userID, { mess: data, ketthucchuyen: "success" });
    //   io.emit(data.taixeID, { mess: data, ketthucchuyen: "success" });
    // }
    
  });
  socket.on("tuchoichuyen",async data => {
    var ddden_X= data.diadiemden_X +""


   await db.Trips.findOne({   diadiemden_X:ddden_X,}, async(err, rs) => {
      rs.status = "Hủy chuyến";
     await rs.save(function (err, rs) {
        if (err) {
          console.log(err);
          io.emit(data.userID, { mess: data, huychuyen: "fail" });
          io.emit(data.taixeID, { mess: data, huychuyen: "fail" });
        } else {
          io.emit(data.userID, { mess: data, huychuyen: "fail" ,success:"false"});
          io.emit(data.taixeID, { mess: data, huychuyen: "fail" ,success:"false"});
        }
      });
    })
  });

  socket.on("tuchoinhanchuyen", data => {
    io.emit(data.userID,{mess:"Tài Xế Từ Chối Chuyến"})


  
  });

  //send location driver autopilot.
  interval = setInterval(() => getApiAndEmit(socket), 3000);

  //disconnect splice item in array.
  socket.on("disconnect", () => {
    clearInterval(interval);
    for (var i = 0; i < arrUser.length; i++) {
      if (arrUser[i].idsocket == socket.id) {
        arrUser.splice(i, 1);
        // break;
      }
    }
    console.log(socket.id + " Client disconnected");
  });

});

//hanle emit : GET API location_driver_online send client in SOCKET
const getApiAndEmit = async socket => {
  try {
    const axios = require("axios");
    axios.get("http://localhost:4000/api/location").then(data_data => {
      // console.log(data_data.data);
      socket.emit("location_driver_online", data_data.data);
    });
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

//hanle port "server"
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
  console.log("Server running address: " + " port: " + port);
}
