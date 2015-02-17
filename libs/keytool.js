var keytool = function(options, cb){
	var exec = require("child_process").exec;

	var command = "keytool -genkey -noprompt";
	command += " -validity " + options.validity.toString();
	command += " -alias " + options.alias;
	command += " -dname \"";
	command += "CN=" + options.service_host;
	command += ",OU=ID,O=DC,C=KR\"";
	command += " -keystore " + options.location;
	command += " -storepass " + options.storePass;
	command += " -keypass " + options.keyPass;

	exec(command, cb);
}

module.exports = keytool;