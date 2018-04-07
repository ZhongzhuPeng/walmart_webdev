var express = require("express");
var request = require("request");
var router  = express.Router();
var bodyparser=require('body-parser');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));
//var middleware = require("../middleware");

//show the search results
router.post("/", function(req, res){
    var query = req.body.search_walmart;
    if(!query) res.end();
    var category = JSON.parse(req.body.categoryId);
    var categoryId = "&categoryId=" + category.id;
    var path = category.path;
    var numItems = "&numItems=24";
    if(category.id === "All") {
        categoryId = "";
    }
    console.log(req.body);
    var url = "http://api.walmartlabs.com/v1/search?query="+query+"&apikey=pe7cnbp2zqnbe9zsnu2dvrfu"+"&format=json&"
            +categoryId + numItems;
    var url_tax = "http://api.walmartlabs.com/v1/taxonomy?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";
    console.log(url);
    request(url, function(error, response, body){
        request(url_tax, function(error1, response1, body1){
            if(!error && !error1 && response.statusCode === 200 && response1.statusCode === 200) {
                var results = JSON.parse(body);
                var tax = JSON.parse(body1);
                var hasNextPage = true;
                if(24 > results.totalResults) {
                    hasNextPage = false;
                }
                res.render("search/search_results", 
                {items: results.items, startPage: 1, url: url,
                    hasNextPage: hasNextPage, hasPrePage: false,
                    taxonomy: tax, query: query, path: path
                });
            }
        });
    });
})

router.post("/:startPage", function(req, res) {
    var startPage = Number(req.params.startPage);
    if(startPage < 1) startPage = 1;
    console.log(req.body);
    var url = req.body.url + "&start=" + startPage;
    var url_tax = "http://api.walmartlabs.com/v1/taxonomy?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";

    console.log(url);
    request(url, function(error, response, body){
        request(url_tax, function(error1, response1, body1){
            if(!error && !error1 && response.statusCode === 200 && response1.statusCode === 200) {
                var results = JSON.parse(body);
                var hasNextPage = true;
                var hasPrePage = true
                var tax = JSON.parse(body1);
                if(startPage+24 > results.totalResults) {
                    hasNextPage = false;
                } else if(startPage-24 <1) {
                    hasPrePage = false;
                }
                res.render("search/search_results", 
                    {items: results.items, startPage: startPage, url: req.body.url,
                        hasNextPage: hasNextPage, hasPrePage: hasPrePage,
                        taxonomy: tax, query: req.body.query, path: req.body.path
                    });
            }
        });
    });
});
module.exports = router;