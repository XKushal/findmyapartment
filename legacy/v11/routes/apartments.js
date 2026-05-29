var express=require("express");
var router = express.Router();
var Apartments = require("../models/apartments")
var middleware = require("../middleware");
var Review = require("../models/review");
var Comment = require("../models/comment");

//INDEX - show all apartments
router.get("/", function(req, res){
    // Get all apartments from DB
    Apartments.find({}, function(err, allApartments){
       if(err){
           console.log("Error Detected");
           console.log(err);
       } else {
          res.render("apartments/index",{apartments:allApartments});
       }
    });
});

//CREATE:Add new Apartments to DB
router.post("/",middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author ={
        id: req.user._id,
        username: req.user.username
    };
    var newApartment = {name: name, image: image, description:description, author:author};
    //apartments.push(newApartment);
    //create a new apartment and save to DB
    Apartments.create(newApartment, function(err, newApt){
        if(err){
            console.log("Error.");
            console.log(err);
        }else{
            //redirect back to apartments
            res.redirect("/apartments");
        }
    });
});

//NEW: show form to create new apartments
router.get("/new",middleware.isLoggedIn, function(req, res) {
    res.render("apartments/new");
});

//SHOW: Shows the detail info about one apartment
router.get("/:id", function(req, res) {
    //find the apartment with provoded id
    Apartments.findById(req.params.id).populate("comments").populate({
        path: "review",
        options:{sort: {createdAt: -1}}
    }).exec(function(err, foundApt){
        if(err || !foundApt){
            req.flash("error","Apartment not found");
            res.redirect("back");
        }else{
            //render show templete with that apartment
            res.render("apartments/show", {apartments:foundApt});
        }
    });
});

//edit apartment route
router.get("/:id/edit", middleware.checkAptOwner, function(req, res){
    Apartments.findById(req.params.id, function(err, foundApt){
        res.render("apartments/edit",{apartments:foundApt});
    });
});

//update apartments routes
router.put("/:id", middleware.checkAptOwner, function(req, res){
    delete req.body.apartments.rating;
    Apartments.findByIdAndUpdate(req.params.id,req.body.apartments, function(err, updatedApartment){
        if(err){
            res.redirect("/apartments");
        }else{
            res.redirect("/apartments/"+req.params.id);
        }
    });
});

// DESTROY apartment ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Apartments.findById(req.params.id, function (err, foundApt) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: foundApt.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: foundApt.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        res.redirect("/apartments");
                    }
                    //  delete the campground
                    foundApt.remove();
                    req.flash("success", "Apartment deleted successfully!");
                    res.redirect("/apartments");
                });
            });
        }
    });
});

module.exports=router;