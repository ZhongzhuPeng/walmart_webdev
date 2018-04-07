var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var request = require("request");
//root route
router.get("/", function(req, res){
    var url_trend = "http://api.walmartlabs.com/v1/trends?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";
    var url_tax = "http://api.walmartlabs.com/v1/taxonomy?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";
    request(url_trend, function(error0, response0, body0){
        request(url_tax, function(error1, response1, body1){
            if(!error0 && !error1 && response0.statusCode === 200 && response1.statusCode === 200) {
                var trending = JSON.parse(body0);
                var taxonomy = JSON.parse(body1);
                res.render("trending", {items : trending.items.slice(0,-1), taxonomy : taxonomy});
            }
            else {
                console.log(error0);
                console.log(error1);
            }
        })
    });
    
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to YelpCamp " + user.username);
           res.redirect("/"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/");
});



module.exports = router;