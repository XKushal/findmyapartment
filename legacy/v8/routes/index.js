var express=require("express");
var router = express.Router();
var passport = require("passport");
var User= require("../models/user");
//root route
router.get("/", function(req, res){
   res.render("landing"); 
});

//register form route
router.get("/register",function(req, res) {
    res.render("register")
});
//handles sign up logic route
router.post("/register", function(req, res){
    var newUser = new User({username:req.body.username});
    User.register(newUser,req.body.password, function(err, user){
       if(err){
           console.log(err);
           return res.render('register');
       } 
       passport.authenticate("local")(req, res, function(){
           res.redirect("/apartments");
       });
    });
});
//show login form route
router.get("/login", function(req, res) {
    res.render("login");
});

//login form  logic 
//app.post("/login",middleware, callback function) 
router.post("/login",passport.authenticate("local",   
    {
        successRedirect: "/apartments",
        failureRedirect: "/login"
    }),function(req,res){
});

//logout route
router.get("/logout",function(req, res) {
    req.logout();//comes from package
    res.redirect("/apartments")
});
//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
module.exports=router;