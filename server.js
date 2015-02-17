var express = require('express');
var app = express();

app.get('/', function(req, res){
	var noa = "--user=" + req.query["user"];
	noa += " --pkgid=" + req.query["pkgid"];
	noa += " --name=" + encodeURI(req.query["name"]);
	noa += " --site=" + req.query["site"];
	noa += " --iconURL=" + req.query["iconURL"];
	noa += " --password=" + encodeURI(req.query["password"]);
	noa += " --plugins=" + req.query["plugins"];

	var exec = require("child_process").exec;
	//exec("source ~/.profile");

	exec("node index.js " + noa, function(){});
	
	res.header("Access-Control-Allow-Origin", "*");
	res.jsonp("{result: 'true'}");
});

app.listen(4001);
