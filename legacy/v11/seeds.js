var mongoose = require("mongoose");
var Apartments = require("./models/apartments");
var Comment   = require("./models/comment");
 
var data = [
    {
        name: "MetroView", 
        image: "https://images.unsplash.com/photo-1538944495092-48fff71fbb0c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        description: "Really nice bedrooms, with better restroom and awesome kitchen.Brand new apartment, completely renovated in 2012 and tastefully furnished, with attention to details, modern colours, designer lighting and high quality accessories. Located in the centre of Trastevere, perfect for those looking for a functional and high standard accommodation. The stylish apartment is approximately 65m2 and can comfortably accommodate up to 4 guests. It is found on the first floor (with lift) of an elegant building, a few steps from Santa Maria Church in Trastevere. The house is hi-tech, including a state of the art lighting system and high speed WIFI internet. It was also constructed with soundproof windows and thermal insulation. The design is characterized by a fluid chromatic sequence through rigorous use of materials, such as Danish parquet in contrast with the light elements and the steel pipes that seem to cut the recently restored ancient brick ceiling."
    },
    {
        name: "UVTs", 
        image: "https://farm3.staticflickr.com/2679/4135037560_bfff6c74db.jpg",
        description: "No good. Brand new apartment, completely renovated in 2012 and tastefully furnished, with attention to details, modern colours, designer lighting and high quality accessories. Located in the centre of Trastevere, perfect for those looking for a functional and high standard accommodation. The stylish apartment is approximately 65m2 and can comfortably accommodate up to 4 guests. It is found on the first floor (with lift) of an elegant building, a few steps from Santa Maria Church in Trastevere. The house is hi-tech, including a state of the art lighting system and high speed WIFI internet. It was also constructed with soundproof windows and thermal insulation. The design is characterized by a fluid chromatic sequence through rigorous use of materials, such as Danish parquet in contrast with the light elements and the steel pipes that seem to cut the recently restored ancient brick ceiling."
    },
    {
        name: "Coborns", 
        image: "https://farm8.staticflickr.com/7042/6913952757_e8cf16bb13.jpg",
        description: "Awesome. Brand new apartment, completely renovated in 2012 and tastefully furnished, with attention to details, modern colours, designer lighting and high quality accessories. Located in the centre of Trastevere, perfect for those looking for a functional and high standard accommodation. The stylish apartment is approximately 65m2 and can comfortably accommodate up to 4 guests. It is found on the first floor (with lift) of an elegant building, a few steps from Santa Maria Church in Trastevere. The house is hi-tech, including a state of the art lighting system and high speed WIFI internet. It was also constructed with soundproof windows and thermal insulation. The design is characterized by a fluid chromatic sequence through rigorous use of materials, such as Danish parquet in contrast with the light elements and the steel pipes that seem to cut the recently restored ancient brick ceiling."
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