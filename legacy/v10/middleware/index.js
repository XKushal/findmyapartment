var Apartments = require("../models/apartments");
var Comment = require("../models/comment");
//all middleware goes here
var middlewareObject= {};
middlewareObject.checkAptOwner= function(req, res, next){
    if(req.isAuthenticated()){
        Apartments.findById(req.params.id, function(err, foundApt){
            if(err){
                res.redirect("back");
            }else{
                if(foundApt.author.id.equals(req.user._id)){
                    next();
                }else{
                    res.redirect("back");
                }
            }
        });
    }else{
        res.redirect("back");//previous page
    }
}

middlewareObject.checkCommentOwner =  function(req, res, next){
    if(req.isAuthenticated()){//is user logged in?
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            }else{//does user own the comment?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }else{
                    res.redirect("back");//if not logged in go back where you come from or log in
                }
            }
        });
    }else{
        res.redirect("back");//previous page
    }
}

middlewareObject.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


module.exports = middlewareObject;