/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, consistent-return: 0, new-cap: 0*/
"use strict";
var express = require("express");

var langparser = require("accept-language-parser");

function getLocale(req) {
	var lang = req.headers["accept-language"];
	if (!lang) {
		return;
	}
	var arr = langparser.parse(lang);
	if (!arr || arr.length < 1) {
		return;
	}
	var locale = arr[0].code;
	if (arr[0].region) {
		locale += "_" + arr[0].region;
	}
	return locale;
}

module.exports = {
	router: function() {
		var app = express.Router();

		//Hello Router
		app.get("/", function(req, res) {
			var output = '';
			var user = req.user && req.user.id;
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