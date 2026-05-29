var mongoose = require("mongoose");
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
    ]
});

//compile schema into the model
module.exports = mongoose.model("Apartment", apartmentsSchema);//model
