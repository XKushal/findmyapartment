var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/StCloudApts', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

//Schema setup
var apartmentsSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

//compile schema into the model
var Apartments = mongoose.model("Apartment", apartmentsSchema);//model

// Apartments.create(
//      {
//          name: "MetroView", 
//          image: "https://pixabay.com/get/ed34b70f2ef61c22d2524518b7444795ea76e5d004b0144593f5c77ea5efb5_340.jpg",
//          description: "Really nice bedrooms, with better restroom and awesome kitchen."
//      },
//      function(err, apartments){
//       if(err){
//           console.log(err);
//       } else {
//           console.log(apartments);
//       }
//     });

// var apartments = [
//         {name: "metroView", image: "https://farm8.staticflickr.com/7042/6913952757_e8cf16bb13.jpg"},
//         {name: "UVTs", image: "https://pixabay.com/get/ef3cb10e2afd1c22d2524518b7444795ea76e5d004b0144593f4c67aa0eeb7_340.jpg"},
//         {name: "Coborns", image: "https://farm3.staticflickr.com/2679/4135037560_bfff6c74db.jpg"},
//         {name: "metroView", image: "https://farm8.staticflickr.com/7042/6913952757_e8cf16bb13.jpg"},
//         {name: "UVTs", image: "https://pixabay.com/get/ef3cb10e2afd1c22d2524518b7444795ea76e5d004b0144593f4c67aa0eeb7_340.jpg"},
//         {name: "Coborns", image: "https://farm3.staticflickr.com/2679/4135037560_bfff6c74db.jpg"},
//         {name: "metroView", image: "https://farm8.staticflickr.com/7042/6913952757_e8cf16bb13.jpg"},
//         {name: "UVTs", image: "https://pixabay.com/get/ef3cb10e2afd1c22d2524518b7444795ea76e5d004b0144593f4c67aa0eeb7_340.jpg"},
//         {name: "Coborns", image: "https://farm3.staticflickr.com/2679/4135037560_bfff6c74db.jpg"}
// ];

app.get("/", function(req, res){
   res.render("landing"); 
});

//INDEX - show all apartments
app.get("/apartments", function(req, res){
    // Get all apartments from DB
    Apartments.find({}, function(err, allApartments){
       if(err){
           console.log("Error Detected");
           console.log(err);
       } else {
          res.render("index",{apartments:allApartments});
       }
    });
});

//CREATE:Add new Apartments to DB
app.post("/apartments",function(req, res){
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
app.get("/apartments/new", function(req, res) {
    res.render("new.ejs");
});

//SHOW: Shows the detail info about one apartment
app.get("/apartments/:id", function(req, res) {
    //find the apartment with provoded id
    Apartments.findById(req.params.id, function(err, foundApt){
        if(err){
            console.log("error detected.");
            console.log(err);
        }else{
            //render show templete with that apartment
            res.render("show", {apartments:foundApt});
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started.")
});