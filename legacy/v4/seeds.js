var mongoose = require("mongoose");
var Apartments = require("./models/apartments");
var Comment   = require("./models/comment");
 
var data = [
    {
        name: "MetroView", 
        image: "https://pixabay.com/get/ed34b70f2ef61c22d2524518b7444795ea76e5d004b0144593f5c77ea5efb5_340.jpg",
        description: "Really nice bedrooms, with better restroom and awesome kitchen."
    },
    {
        name: "UVTs", 
        image: "https://farm3.staticflickr.com/2679/4135037560_bfff6c74db.jpg",
        description: "No good"
    },
    {
        name: "Coborns", 
        image: "https://farm8.staticflickr.com/7042/6913952757_e8cf16bb13.jpg",
        description: "Awesome"
    }
]
 
function seedDB(){
   //Remove all campgrounds
   Apartments.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed an apartment!");
        // Comment.remove({}, function(err) {
        //     if(err){
        //         console.log(err);
        //     }
        //     console.log("removed comments!");
        //      //add a few apartments
            data.forEach(function(seed){
                Apartments.create(seed, function(err, apartment){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("added an apartment");
        //                 //create a comment
                        Comment.create(
                            {
                                text: "Really nice bedrooms, with better restroom and awesome kitchen",
                                author: "Kushal"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    apartment.comments.push(comment);
                                    apartment.save();
                                    console.log("Created new comment");
                                }
                            });
                    }
        //         });
            });
        });
    }); 
    //add a few comments
}
 
module.exports = seedDB;