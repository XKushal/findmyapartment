var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Apartments = require("./models/apartments");
var seedDB = require("./seeds");
var Comment  = require("./models/comment");
var passport = require("passport");
var localStrategy  =require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User  = require("./models/user");

mongoose.connect('mongodb://localhost:27017/Apts_6', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// seedDB();//seed the data base
//requiring routes
var commentsRoutes = require("./routes/comments"),
    apartmentRoutes = require("./routes/apartments"),
    indexRoutes = require("./routes/index");

//passport configuration
app.use(require("express-session")({
    secret: "i am metroview: apartment",
    resave: false,
    saveUninitialized :false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));//middleware
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoutes);
app.use("/apartments/:id/comments",commentsRoutes);
app.use("/apartments",apartmentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started.");
});