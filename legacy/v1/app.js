var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

var apartments = [
        {name: "metroView", image: "https://farm8.staticflickr.com/7042/6913952757_e8cf16bb13.jpg"},
        {name: "UVTs", image: "https://pixabay.com/get/ef3cb10e2afd1c22d2524518b7444795ea76e5d004b0144593f4c67aa0eeb7_340.jpg"},
        {name: "Coborns", image: "https://farm3.staticflickr.com/2679/4135037560_bfff6c74db.jpg"},
        {name: "metroView", image: "https://farm8.staticflickr.com/7042/6913952757_e8cf16bb13.jpg"},
        {name: "UVTs", image: "https://pixabay.com/get/ef3cb10e2afd1c22d2524518b7444795ea76e5d004b0144593f4c67aa0eeb7_340.jpg"},
        {name: "Coborns", image: "https://farm3.staticflickr.com/2679/4135037560_bfff6c74db.jpg"},
        {name: "metroView", image: "https://farm8.staticflickr.com/7042/6913952757_e8cf16bb13.jpg"},
        {name: "UVTs", image: "https://pixabay.com/get/ef3cb10e2afd1c22d2524518b7444795ea76e5d004b0144593f4c67aa0eeb7_340.jpg"},
        {name: "Coborns", image: "https://farm3.staticflickr.com/2679/4135037560_bfff6c74db.jpg"}
];

app.get("/", function(req, res){
   res.render("landing"); 
});

app.get("/apartments", function(req, res){
    res.render("apartments",{apartments:apartments});
});

app.post("/apartments",function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var newApartment = {name: name, image: image}
    apartments.push(newApartment);
    res.redirect("/apartments");
});

app.get("/apartments/new", function(req, res) {
    res.render("new.ejs");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started.")
});