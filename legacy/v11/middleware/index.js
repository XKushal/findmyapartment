var Apartments = require("../models/apartments");
var Comment = require("../models/comment");
var Review = require("../models/review");

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

middlewareObject.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObject.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Apartments.findById(req.params.id).populate("review").exec(function (err, foundApt) {
            if (err || !foundApt) {
                req.flash("error", "Apartment not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundApt.review.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/apartments/" + foundApt._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};


middlewareObject.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "you need to be logged in ton do that.");//key and value
    res.redirect("/login");
}


module.exports = middlewareObject;