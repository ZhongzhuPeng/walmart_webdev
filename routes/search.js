var express = require("express");
var request = require("request");
var router  = express.Router();
var bodyparser=require('body-parser');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));
//var middleware = require("../middleware");

//show the search results
router.get("/:query/:path/:categoryId/:sort/:order/:startPage?", function(req, res){
    var query = req.params.query;
    var categoryId = (req.params.categoryId === "All"? "" : "&categoryId=" + req.params.categoryId);
    var path = req.params.path;
    var sort = "&sort=" + req.params.sort;
    var order = "&order=" + req.params.order;
    var start = Number(req.params.startPage) || 1;
    var startPage = (start > 1? "&start="+start : "");

    var url_tax = "http://api.walmartlabs.com/v1/taxonomy?format=json&apiKey=pe7cnbp2zqnbe9zsnu2dvrfu";
    var numItems = "&numItems=24";
    console.log(req.params);
    
    var url = "http://api.walmartlabs.com/v1/search?query="+query+
                "&apikey=pe7cnbp2zqnbe9zsnu2dvrfu"+"&format=json&"
                +categoryId + numItems + sort + order + startPage;
    console.log(url);
    request(url, function(error, response, body){
        request(url_tax, function(error1, response1, body1){
            if(!error && !error1 && response.statusCode === 200 && response1.statusCode === 200) {
                var results = JSON.parse(body);
                var tax = JSON.parse(body1);
                var hasNextPage = (start+24 <= results.totalResults);
                var hasPrePage = (start > 1)
                res.render("search/search_results", 
                {items: results.items, startPage: start,
                    hasNextPage: hasNextPage, hasPrePage: hasPrePage,
                    taxonomy: tax, query: query, path: path, categoryId: req.params.categoryId,
                    sort: req.params.sort, order: req.params.order
                });
            }
        });
    });
})

router.post("/", function(req, res){
    var query = req.body.search_walmart;
    if(!query) res.redirect("/");
    var category = JSON.parse(req.body.categoryId);
    var path = category.path;
    console.log(req.body);
    res.redirect("/search/"+query+"/"+path+"/"+category.id+"/relevance/asc");
})

module.exports = router;