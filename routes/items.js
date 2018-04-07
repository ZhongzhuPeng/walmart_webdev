var express = require("express");
var request = require("request");
var router  = express.Router();
var Wishlist = require("../models/wishlist");
var middleware = require("../middleware");

router.get("/", function(req, res){
    res.render("items/index.ejs");
});

router.get("/trending", function(req, res) {
    var url = "http://api.walmartlabs.com/v1/trends?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";
    request(url, function(error, response, body){
        if(!error && response.statusCode === 200) {
            var results = JSON.parse(body);
            res.render("items/trending", { items : results.items });
        }
    });
});

router.get("/taxonomy", function(req, res) {
    var url = "http://api.walmartlabs.com/v1/taxonomy?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";
    request(url, function(error, response, body){
        if(!error && response.statusCode === 200) {
            var results = JSON.parse(body);
            res.render("items/taxonomy", {taxonomy : results });
        }
    });
});

router.get("/wishlist", function(req, res){
    //Get all wish items from DB
    Wishlist.find({}, function(err, allWishItems){
        if(err){
            console.log(err);
        } else {
            res.render("items/wishlist",{items: allWishItems});
        }
    });
});

router.get("/:item_id", function(req, res){
    var itemId = req.params.item_id;
    var reviews_url = "http://api.walmartlabs.com/v1/reviews/" + itemId + "?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";
    var item_url = "http://api.walmartlabs.com/v1/items/" + itemId + "?format=json&apikey=pe7cnbp2zqnbe9zsnu2dvrfu";
    var url = "http://api.walmartlabs.com/v1/taxonomy?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";
    request(item_url, function(error0, response0, body0){
        request(reviews_url, function(error1, response1, body1){
            request(url, function(error, response, body){
                if(!error0 && !error1 && !error 
                    && response0.statusCode === 200 && response1.statusCode === 200 && response.statusCode === 200) {
                    var item = JSON.parse(body0);
                    var reviews = JSON.parse(body1);
                    var taxonomy = JSON.parse(body);
                    res.render("items/item_reviews", {item : item, reviews: reviews, taxonomy: taxonomy});     
                }
                else {
                    console.log(response0.statusCode);
                    console.log(response1.statusCode);
                    console.log(response.statusCode);
                }
            });
        });
    });
});

router.post("/:item_id", middleware.isLoggedIn, function(req, res){
    var itemId = req.params.item_id;
    var notes = req.body.notes;
    var item_url = "http://api.walmartlabs.com/v1/items/" + itemId + "?format=json&apikey=pe7cnbp2zqnbe9zsnu2dvrfu";
    request(item_url, function(error, response, body){
        if(!error && response.statusCode === 200 ) {
            var item = JSON.parse(body);
            //res.render("items/item_reviews", {item : item});     
            var itemId = item.itemId;
            var name = item.name;
            var image = item.largeImage;
            var salePrice = item.salePrice;
            var author = {
                id: req.user._id,
                username: req.user.username
            };
            var newWishItem = {notes: notes, itemId: itemId, name: name, largeImage: image, salePrice: salePrice, author:author};
            Wishlist.create(newWishItem, function(err, newlyCreated){
                if(err){
                    console.log(err);
                } else {
                    //redirect back to campgrounds page
                    console.log(newlyCreated);
                    res.redirect("/items/wishlist");
                }
            });
        }
        else {
            console.log(error);
        }
    });
});


// DESTROY CAMPGROUND ROUTE
router.delete("/wishlist/:id",middleware.checkItemOwnership, function(req, res){
   Wishlist.findByIdAndRemove(req.params.id, function(err){
      if(err){
          console.log(err);
      }
      res.redirect("/items/wishlist");
   });
});


module.exports = router;