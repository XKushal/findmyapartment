var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var Apartments = require("./models/apartments");
var seedDB = require("./seeds");
var Comment  = require("./models/comment");
var passport = require("passport");
var localStrategy  =require("passport-local");
var methodOverride = require("method-override")
var passportLocalMongoose = require("passport-local-mongoose");
var User  = require("./models/user");

mongoose.connect('mongodb://localhost:27017/Apts_6', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();//seed the data base

//requiring routes
var commentsRoutes = require("./routes/comments"),
    reviewRoutes     = require("./routes/review"),
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
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/apartments/:id/comments",commentsRoutes);
app.use("/apartments",apartmentRoutes);
app.use("/apartments/:id/review", reviewRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started.");
});