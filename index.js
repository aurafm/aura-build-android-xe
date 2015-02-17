var opt = require("node-getopt").create([
	["u", "user=ARG", "..."],
	["p", "pkgid=ARG", "..."],
	["i", "iconURL=ARG", "..."],
	["g", "plugins=ARG", "..."],
	["w", "password=ARG", "..."],
	["n", "name=ARG", "..."],
	["s", "site=ARG", "..."],
]).parseSystem();

var o_user = require("./libs/user");
var o_extractPath = __dirname + "/server/users/" + opt.options.user + "/" + opt.options.pkgid;
var o_iconURL = opt.options.iconURL;
var o_plugins = opt.options.plugins.split("+");

var o_password = opt.options.password;

var o_name = decodeURI(opt.options.name);
var o_site = opt.options.site;

var base = require("./libs/archive")("./server/base.zip", o_extractPath);
base.on("close", function(){
	o_user.log("(1) 베이스 파일을 준비합니다.");
	o_user.log("(2) 베이스 파일을 준비 완료 하였습니다.");

	setTimeout(function(){
		o_user.log("(3) 서명키를 생성합니다.");

		var keytool = require("./libs/keytool");
		keytool({
			"validity": 10000,
			"alias": "keystore_alias",
			"service_host": "devconf.cf",
			"location": o_extractPath + "/keystore.keystore",
			"storePass": o_password,
			"keyPass": o_password
		}, function(){
			o_user.log("(4) 서명키를 생성 완료 하였습니다.");

			setTimeout(function(){
				o_user.log("(5) 플러그인을 설치합니다.");
				var cla = 0;

				for(var x in o_plugins){
					if(o_plugins[x] == "")
						continue;
					cx = require("./libs/archive")("./server/plugins/" + o_plugins[x] + ".zip", o_extractPath + "/plugins/" + o_plugins[x]);
					cx.on("close", function(){
						if(x == o_plugins.length - 1){
							o_user.log("(6) 플러그인을 모두 설치하였습니다.");
							o_user.log("(7) 어플리케이션 기본 설정을 시작합니다.");

							var fs = require("fs");
							var http = require("http");

							var icoFile = fs.createWriteStream(o_extractPath + "/www/icon.png");
							http.get(o_iconURL, function(response){
								response.pipe(icoFile);
							});

							var configURL = o_extractPath + "/config.xml";
							var confData = fs.readFileSync(configURL, "utf8");
							fs.writeFileSync(configURL, confData.replace("$$ID$$", opt.options.pkgid).replace("$$NAME$$", o_name).replace("$$URL$$", o_site));

							confData = fs.readFileSync(configURL, "utf8");
							var oP = opt.options.plugins.replace(/\+/g, "' />\n<gap:plugin name='");
							oP = "<gap:plugin name='" + oP + "' />";
							fs.writeFileSync(configURL, confData.replace("$$PLUGIN$$", oP));

							o_user.log("(8) 어플리케이션 기본 설정이 완료되었습니다.");
							o_user.log("(9) 안드로이드 타겟 설정을 시작합니다.");

							var cordova = require("./node_modules/cordova");

							var cur = __dirname;
							process.chdir(o_extractPath);

							cordova.platform("add", "android", function(){
								if(fs.existsSync("./platforms/android") == true){
									o_user.log("(10) 안드로이드 타겟 설정을 완료하였으며, 빌드를 시작합니다.");
									cordova.build({"options": ["--release"]}, function(){
										process.chdir(cur);

										var o_apk = o_extractPath + "/platforms/android/ant-build/CordovaApp-release-";

										var exec = require("child_process").exec;
										exec("jarsigner -keystore " + o_extractPath + "/keystore.keystore -storepass " + o_password + " " + o_apk + "unsigned.apk" + " keystore_alias", function(){
											exec("libs/lib_sign/zipalign -v 4 " + o_apk + "unsigned.apk" + " " + o_apk + "signed.apk", function(){
												exec("chmod -R 0707 " + o_apk + "unsigned.apk");
											});
										});
									});
								}
							});
						}
					});
				}
			}, 300);
		});
	}, 100);
});
