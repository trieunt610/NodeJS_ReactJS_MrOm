var express = require("express");
const db = require("../db/connect");
var app = express();
var md5 = require("md5");

var bodyParser = require("body-parser");

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//LOGIN, SIGNUP , CHECKTOKEN
// -- login theo username
app.post("/username", function(req, res, next) {
  // db.Accounts.findOne({ UserName: req.body.UserName }, function(err, data) {
  //   if (err) {
  //     console.log(err);
  //     res.status(500).send();
  //   } else {
  //     if (!data) {
  //       res.status(400).send();
  //     } else {
  //       if (data.Status == 96) {
  //         // 96 = status active
  //         var username = req.body.UserName;
  //         var password = req.body.Password;
  //         if (username == data.UserName && password == data.Password) {
  //           var token = {
  //             id: data.AccountID,
  //             token: data.Token,
  //             Role: data.Role
  //           };
  //           res.status(200).send(token);
  //         } else {
  //           res.status(400).send(false);
  //         }
  //         data.save(function(err, rs) {
  //           if (err) {
  //             console.log(err);
  //             res.status(500).send();
  //           } else {
  //             res.send(rs);
  //           }
  //         });
  //       } else if (data.Status == 69) {
  //         // 69 = status lock
  //         var trave = {
  //           UserName: data.UserName,
  //           Name: data.Name,
  //           WhyLock: data.WhyLock
  //         };
  //         res.send(400, trave);
  //       } else if (data.Status == 0) {
  //         //0 = status chưa active
  //         var trave = {
  //           UserName: data.UserName,
  //           Name: data.Name,
  //           CreateDate: data.CreateDate
  //         };
  //         res.send(200, trave);
  //       } else {
  //         res.send(400, "Bug!");
  //       }
  //     }
  //   }
  // });
});

// -- lgin theo email
app.post("/", async function(req, res, next) {
  try {
    await  db.Accounts.findOne({ UserName : req.body.Email },async (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send("Đã xảy ra lỗi bất ngờ");
      } else {
        if (data) {
        
          if (data.Status == 96 && data.Role == 1) {
            if (req.body.Password == data.Password) {
              var token_send = {
                id:req.body.Email,
                token: data.Token,
                Role: data.Role
              };
              res.status(200).send(token_send);
            } else {
              res.status(400).send("Sai email hoac mat khau");
            }
          }
          else
          {
            await db.InformationUsers.findOne({ Email: req.body.Email }, async function(
              err,
              data
            ) {
              if (err) {
                console.log(err);
                res.status(500).send();
              } else {
                
                if (!data) {
        
                  await db.InformationDrivers.findOne(
                    { Email: req.body.Email },
                    function(err, data) {
                      if (err) {
                        console.log(err);
                        res.status(500).send("Đã xảy ra lỗi bất ngờ");
                      } else {
                        if (!data) {
                          res.status(400).send("Sai email hoac mat khau");
                        } else {
                          // 96 = status active
                          var AccountID = data.AccountID;
                          
                          db.Accounts.findOne({ _id: AccountID }, (err, data) => {
                            if (err) {
                              console.log(err);
                              res.status(500).send("Đã xảy ra lỗi bất ngờ");
                            } else {
                              if (!data) {
                                res.status(400).send("Sai email hoac mat khau");
                              } else {
                                console.log("bo qua db dau");
                                if (data.Status == 96) {
                                  if (req.body.Password == data.Password) {
                                    var token_send = {
                                      id: AccountID,
                                      token: data.Token,
                                      Role: data.Role
                                    };
                                    res.status(200).send(token_send);
                                  } else {
                                    res.status(400).send("Sai email hoac mat khau");
                                  }
                                } else if (data.Status == 69) {
        
                                  // 69 = status lock
                                  var trave = {
                                    UserName: data.UserName,
                                    Name: data.Name,
                                    WhyLock: data.WhyLock
                                  };
                                  res.send(400, trave);
                                } else if (data.Status == 0) {
                                  //0 = status chưa active
                                  var trave = {
                                    UserName: data.UserName,
                                    Name: data.Name,
                                    CreateDate: data.CreateDate
                                  };
                                
                                  res.status(200).send(trave)
                                } else {
                                  res.send(400, "Bug!");
                                }
                              }
                            }
                          });
                        }
                      }
                    }
                  );
                }
                else{
                  console.log("vo else");
                  var AccountID = data.AccountID;
                  db.Accounts.findOne({ _id: AccountID }, (err, data) => {
                    if (err) {
                      console.log(err);
                      res.status(500).send("Đã xảy ra lỗi bất ngờ");
                    } else {
                      if (!data) {
                        res.status(400).send("Sai email hoac mat khau");
                      } else {
                        if (data.Status == 96) {
                          if (req.body.Password == data.Password) {
                            var token_send = {
                              id: AccountID,
                              token: data.Token,
                              Role: data.Role
                            };
                            res.status(200).send(token_send);
                          } else {
                            res.status(400).send("Sai email hoac mat khau");
                          }
                        } else if (data.Status == 69) {
                          // 69 = status lock
                          var trave = {
                            UserName: data.UserName,
                            Name: data.Name,
                            WhyLock: data.WhyLock
                          };
                          res.send(400, trave);
                        } else if (data.Status == 0) {
                          //0 = status chưa active
                          var trave = {
                            UserName: data.UserName,
                            Name: data.Name,
                            CreateDate: data.CreateDate
                          };
                          res.send(200, trave);
                        } else {
                          res.send(400, "Bug!");
                        }
                      }
                    }
                  });
                }
             
              }
            });
          }
        }
      }
    })

          
    

  } catch (err) {
    res.status(500).send("Đã xảy ra lỗi bất ngờ" + err);
  }
});

app.post("/checktoken", function(req, res, next) {
  try {
    db.Accounts.findOne({ _id: req.body.AccountID }, function(err, data) {
      if (err) {
        console.log(err);
        res.status(500).end();
      } else {
        if (!data) {
          res.status(400).end();
        } else {
          var id = req.body.AccountID;
          var token = req.body.Token;
          var role = req.body.Role;
          if (
            id == data._id &&
            token == data.Token &&
            role == data.Role
          ) {
            if (data.Status == 96) {
              res.status(200).send(true);
            } else if (data.Status == 69) {
              res.status(400).send("Lock");
            } else if (data.Status == 0) {
              res.status(200).send("UnActive");
            } else {
              res.status(400).send("Bug!");
            }
          } else {
            res.status(400).send(false);
          }
        }
      }
    });
  } catch (err) {
    res.status(500).send("Đã xảy ra lỗi bất ngờ" + err);
  }
});

module.exports = app;
