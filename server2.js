var express = require('express');
var app = express();

app.get('/', function(req, res){
        var noa = "server/users/" + req.query["username"];
        noa += "/" + req.query["package"];
		noa += "/platforms/android/ant-build/CordovaApp-release-unsigned.apk";
        
		var fs = require("fs");
		res.header("Access-Control-Allow-Origin", "*");
    	res.jsonp({"result": fs.existsSync(noa).toString()});
});

app.get('/app.apk', function(req, res){
        var noa = "server/users/" + req.query["username"];
        noa += "/" + req.query["package"];
        noa += "/platforms/android/ant-build/CordovaApp-release-unsigned.apk";
	
        res.sendFile(__dirname + "/" + noa);
	
	setTimeout(function(){
		var fs = require("fs");
		fs.unlinkSync(noa);
	}, 60000);
});

app.listen(4000);
