var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html/";
var MongoClient = require('mongodb').MongoClient;
http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  console.log("urlObjpath: " + urlObj.pathname);
  if (urlObj.pathname.indexOf("addComments") != -1) {
    console.log("add comment route");
    if (req.method === "POST") {
      console.log("POST comment route");
      var jsonData = "";
      req.on('data', function (chunk) {
	jsonData += chunk;
      });
      req.on('end', function () {
	var reqObj = JSON.parse(jsonData);
	console.log(reqObj);
	console.log("Name: " + reqObj.Name);
	console.log("Comment: " + reqObj.Comment);
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
	  if (err) throw err;
	  db.collection('comments').insert(reqObj,function(err,records) {
	    console.log("Record added as " + records[0]._id);
	    res.writeHead(200);
	    res.end("");   
	  });
	});
      });
    }
  }
  else if (urlObj.pathname.indexOf("getComments") != -1) {
    if (req.method === "GET") {
      console.log("In GET");
      MongoClient.connect("mongodb://localhost/weather", function(err, db) {
        if (err) throw err;
	db.collection('comments', function(err, comments) {
	  if (err) throw err;
	  comments.find(function(err, items) {
	    items.toArray(function(err, itemArr) {
	      console.log("Document Array: ");
	      console.log(itemArr);
	      res.writeHead(200);
	      res.end(JSON.stringify(itemArr));
	    });
	  });
	});
      });
    }
  }
  else if (urlObj.pathname.indexOf("selectCity") != -1) {
    console.log("in selectCity function");
    fs.readFile(ROOT_DIR + "cities.dat.txt", function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      console.log("about to set data to cities");
      var cities = data.toString().split("\n");
      var json = [];
      var myRe = new RegExp("^" +  urlObj.query["q"]);
      for (var i = 0; i < cities.length; i++) {
	var result = cities[i].search(myRe);
        if (result != -1) {
          json.push({city:cities[i]});
        }
      }
      console.log(JSON.stringify(json));
      res.writeHead(200, { 'Content-Type': 'jsonp' });
      res.end(JSON.stringify(json));
      return;
    });
  }
  else {
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}).listen(80);
