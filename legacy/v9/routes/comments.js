var express=require("express");
var router = express.Router({mergeParams:true});
var Apartments = require("../models/apartments");
var Comment = require("../models/comment");
//comments new 
router.get("/new",isLoggedIn, function(req, res) {
    //find apartment by id
    Apartments.findById(req.params.id, function(err, apartment){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{apartment: apartment});
        }
    });
});

//comments create
router.post("/", isLoggedIn, function(req, res){
    //look apartment by id
    Apartments.findById(req.params.id,function(err, apartment) {
        if(err){
            console.log(err);
            res.redirect("/apartments");
        }else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    //add username and if to comment and save
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    apartment.comments.push(comment);
                    apartment.save();
                    res.redirect('/apartments/' + apartment._id);
                }
            });
        }
    });
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
module.exports=router;