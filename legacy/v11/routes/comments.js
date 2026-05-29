var express=require("express");
var router = express.Router({mergeParams:true});
var Apartments = require("../models/apartments");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//comments new 
router.get("/new",middleware.isLoggedIn, function(req, res) {
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
router.post("/", middleware.isLoggedIn, function(req, res){
    //look apartment by id
    Apartments.findById(req.params.id,function(err, apartment) {
        if(err){
            console.log(err);
            res.redirect("/apartments");
        }else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error","Something went wrong");
                    console.log(err);
                }else{
                    //add username and if to comment and save
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    apartment.comments.push(comment);
                    apartment.save();
                    // console.log(comment);
                    req.flash("success","successfully added comments");
                    res.redirect('/apartments/' + apartment._id);
                }
            });
        }
    });
});

//edit route
router.get("/:comment_id/edit", middleware.checkCommentOwner, function(req, res){
    Apartments.findById(req.params.id, function(err, foundApt) {
        if(err || !foundApt){
            req.flash("error","Apartment not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                res.redirect("back");
            }else{
                res.render("comments/edit",{apartment_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//comment update
router.put("/:comment_id",middleware.checkCommentOwner, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/apartments/" + req.params.id);
        }
    });
});

//comments destroy routes
router.delete("/:comment_id",middleware.checkCommentOwner, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       }else{
           req.flash("success","Comment deleted");
           res.redirect("/apartments/" + req.params.id); //show page
       }
   });
});

module.exports=router;