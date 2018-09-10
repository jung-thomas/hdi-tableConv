/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";
var express = require("express");

var langparser = require("accept-language-parser");

function getLocale(req) {
	let lang = req.headers["accept-language"];
	if (!lang) {
		return;
	}
	let arr = langparser.parse(lang);
	if (!arr || arr.length < 1) {
		return;
	}
	let locale = arr[0].code;
	if (arr[0].region) {
		locale += "_" + arr[0].region;
	}
	return locale;
}

module.exports = {
	router: () => {
		var app = express.Router();

		//Hello Router
		app.get("/", (req, res) => {
			let output = "";
			let user = req.user && req.user.id;
			output = JSON.stringify({
				"session": [{
					"UserName": user && user.toUpperCase(),
					"Language": getLocale(req)
				}]
			});
			res.type("application/json").status(200).send(output);
		});

		return app;
	}
};