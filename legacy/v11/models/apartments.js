var mongoose = require("mongoose");
var Comment = require("./comment");
var Review = require("./review");

//Schema setup
var apartmentsSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    author: {
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
             ref: "Comment"
        }
    ],
    review: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

//compile schema into the model
module.exports = mongoose.model("Apartment", apartmentsSchema);//model
