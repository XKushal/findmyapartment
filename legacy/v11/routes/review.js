var express = require("express");
var router = express.Router({mergeParams: true});
var Apartments = require("../models/apartments");
var Review = require("../models/review");
var middleware = require("../middleware");

// Reviews Index
router.get("/", function (req, res) {
    Apartments.findById(req.params.id).populate({
        path: "review",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec(function (err, foundApts) {
        if (err || !foundApts) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("review/index", {apartments: foundApts});
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    // middleware.checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed
    Apartments.findById(req.params.id, function (err, foundApts) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("review/new", {apartments: foundApts});

    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    //lookup campground using ID
    Apartments.findById(req.params.id).populate("review").exec(function (err, foundApts) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated apartment to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.apartments = foundApts;
            //save review
            review.save();
            foundApts.review.push(review);
            // calculate the new average review for the apartment
            foundApts.rating = calculateAverage(foundApts.review);
            //save apartment
            foundApts.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/apartments/' + foundApts._id);
        });
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("review/edit", {apartment_id: req.params.id, review: foundReview});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Apartments.findById(req.params.id).populate("review").exec(function (err, apartment) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            apartment.rating = calculateAverage(apartment.reviews);
            //save changes
            apartment.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/apartments/' + apartment._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Apartments.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, apartment) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate apartment average
            apartment.rating = calculateAverage(apartment.reviews);
            //save changes
            apartment.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/apartments/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;
