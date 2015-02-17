var uz = function(basePath, extractPath){
	var fs = require("fs");
	var unzip = require("unzip");
	
	var base = fs.createReadStream(basePath);

	return base.pipe(unzip.Extract(
		{ "path": extractPath }
	));
};

module.exports = uz;