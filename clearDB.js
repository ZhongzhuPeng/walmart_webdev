var mongoose = require("mongoose");
var Wishlist = require("./models/wishlist");

function clearWishlist() {
    Wishlist.remove({}, function(err){
        if(err){
            console.log(err);
        }
    });
}

module.exports = clearWishlist;
