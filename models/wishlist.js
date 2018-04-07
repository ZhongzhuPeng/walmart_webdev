var mongoose = require("mongoose");

var wishlistSchema = new mongoose.Schema({
    itemId: Number,
    name: String,
    largeImage: String,
    salePrice: Number,
    notes: String,
    author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
    },
});

module.exports = mongoose.model("Wishlist", wishlistSchema);