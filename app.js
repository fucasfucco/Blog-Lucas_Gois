//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGOKEY, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

const postSchema = {
  title: String,
  content: String,
  author: String,
};

const Post = mongoose.model("Post", postSchema);

const messageSchema = {
  author: String,
  message: String,
  date: String
};

const Message = mongoose.model("Message", messageSchema);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://polar-shore-39060.herokuapp.com/auth/google/home",
  userProfileURL: process.env.GOOGLE_PROFILE
},
function(accessToken, refreshToken, profile, cb) {
    console.log(profile.displayName);
     User.findOrCreate({ googleId: profile.id , googleName: profile.displayName}, function (err, user) {
       return cb(err, user);
     });
}
));

app.get("/auth/google",
    passport.authenticate("google", {scope: ["profile"] })
);

app.get("/auth/google/home",
passport.authenticate("google", {failureRedirect: "/login"}),
function(req, res){
    res.redirect("/logged");
 
});

app.get("/register-login", function(req, res){
  res.render("register-login");
});
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})

app.post("/register-login", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, User){
      if(err){
          console.log(err);
          res.redirect("register-login");
      }else{
          passport.authenticate("local")(req, res, function(){
              res.redirect("/");
          });
      }
  });
});

app.post("/login", function(req, res){
  const user = new User({
      username: req.body.username,
      password: req.body.password
  });

  req.login(user, function(err){
      if(err){
          console.log(err);
      }else{
          passport.authenticate("local", { failureRedirect: '/register-login-fail', failureFlash: true })(req, res, function(){
              res.redirect("/logged");   
          });
      }
  });
});

app.get("/register-login-fail", function(req, res){
  res.render("register-login");
});

app.get("/logged", function(req, res){ 
  if (req.isAuthenticated()){ 
  Post.find({}, function(err, posts){
    Message.find({}, function(err, messages){
      res.render("logged", {
        messages: messages,
        posts:posts,
        username: req.user.username
      })
    })
  }); 
}else {
  res.redirect("/register-login");
}
});

app.get("/", function(req, res){ 
  Post.find({}, function(err, posts){
    Message.find({}, function(err, messages){
      res.render("home", {
        messages: messages,
        posts:posts
      })
    })
  });
});

app.post("/compose", function(req, res){
  if (req.isAuthenticated()){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.user.username,
  });
  if(req.body.postTitle.length != 0 && req.body.postBody.length != 0  && req.body.postTitle.length < 500 && req.body.postBody.length < 500){
  post.save(function(err){
    if (!err){   
      if (req.isAuthenticated()){
        res.redirect("/logged");
      }else{
        console.log(err);
        res.redirect("/"); 
    }  
      }
    });
  }else{
    res.redirect("/");
  }
}else {
  res.redirect("/register-login");
}
});

app.post("/anon", function(req, res){
  if (req.isAuthenticated()){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  if(req.body.postTitle.length != 0 && req.body.postBody.length != 0  && req.body.postTitle.length < 500 && req.body.postBody.length < 500){
    post.save(function(err){
      if (!err){   
        if (req.isAuthenticated()){
          res.redirect("/logged");
        }else{
          res.redirect("/");
      }
        }
      });
    }else{
      res.redirect("/");
    }
  } else {
    res.redirect("/register-login");
  }
});

app.post("/delete", function(req, res){
  if (req.isAuthenticated()){
  const checkedPostId = req.body.buttonDelete;
  Post.findByIdAndRemove(checkedPostId, function(err){
    if(!err){
      console.log("Successfully deleted checked item.");
      res.redirect("/");
  }
  });
}else {
  res.redirect("/register-login");
}
});

app.get("/posts/:postId", function(req, res){
  if (req.isAuthenticated()){
   
const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });
}else {
  res.redirect("/register-login");
}
});

//SOCKET CHAT//SOCKET CHAT//SOCKET CHAT//SOCKET CHAT//SOCKET CHAT
io.on("connection", socket => {
  console.log(`socket conectado: ${socket.id}`);
  Message.find({}, function(err, msg){
    if(!err){
      var sendMessages = msg;
      //console.log(sendMessages);
    }
  socket.emit("previousMessages", sendMessages);
});
  socket.on("sendMessage", data => {
    const message = new Message({
      author: data.author,
      message: data.message,
      date: data.dateMessage
    });
    message.save(function(err){
      if(!err){
        console.log("succecs");
      }else{
        console.log("failed");
        console.log(data);
      }
    });
    socket.broadcast.emit("receivedMessage", data);
  });
});
//SOCKET CHAT//SOCKET CHAT//SOCKET CHAT//SOCKET CHAT//SOCKET CHAT


app.get("/mensage", function(req,res){
  res.render("home", {username: req.user.username})
});

app.get("/about", function(req, res){
  res.render("about");
});
app.get("/contact", function(req, res){
  res.render("contact");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
server.listen(port, function() {
  console.log("Server started, Welcome!");
});
