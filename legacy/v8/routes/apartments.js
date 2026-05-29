var express=require("express");
var router = express.Router();
var Apartments = require("../models/apartments")
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
router.post("/",function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newApartment = {name: name, image: image, description:description}
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
    })
});

//NEW: show form to create new apartments
router.get("/new", function(req, res) {
    res.render("apartments/new");
});

//SHOW: Shows the detail info about one apartment
router.get("/:id", function(req, res) {
    //find the apartment with provoded id
    Apartments.findById(req.params.id).populate("comments").exec(function(err, foundApt){
        if(err){
            console.log("error detected.");
            console.log(err);
        }else{
            //render show templete with that apartment
            res.render("apartments/show", {apartments:foundApt});
        }
    });
});
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
module.exports=router;