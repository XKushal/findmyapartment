var express=require("express");
var router = express.Router();
var Apartments = require("../models/apartments")
var middleware = require("../middleware");

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
    Apartments.findById(req.params.id).populate("comments").exec(function(err, foundApt){
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
    Apartments.findByIdAndUpdate(req.params.id,req.body.apartments, function(err, updatedApartment){
        if(err){
            res.redirect("/apartments");
        }else{
            res.redirect("/apartments/"+req.params.id);
        }
    });
});

//destroy apartments routes
router.delete("/:id",middleware.checkAptOwner, function(req, res){
    Apartments.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/apartments");
        }else{
            res.redirect("/apartments");
        }
    });
});


module.exports=router;