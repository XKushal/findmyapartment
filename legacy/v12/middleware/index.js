var Apartments = require("../models/apartments");
var Comment = require("../models/comment");
//all middleware goes here
var middlewareObject= {};
middlewareObject.checkAptOwner = function(req, res, next){
    if(req.isAuthenticated()){
        Apartments.findById(req.params.id, function(err, foundApt){
            if(err || !foundApt){
                req.flash("error", "Apartment not found.");
                res.redirect("back");
            }else{
                if(foundApt.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "you dont have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error","You need to be logged in to do that.")
        res.redirect("back");//previous page
    }
}

middlewareObject.checkCommentOwner =  function(req, res, next){
    if(req.isAuthenticated()){//is user logged in?
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error","comment not found");
                res.redirect("back");
            }else{//does user own the comment?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.from("error","you dont have permission to do that.");
                    res.redirect("back");//if not logged in go back where you come from or log in
                }
            }
        });
    }else{
        req.from("error","you need to be logged in to do that.");
        res.redirect("back");//previous page
    }
}

middlewareObject.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "you need to be logged in ton do that.");//key and value
    res.redirect("/login");
}


module.exports = middlewareObject;