/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, consistent-return: 0, new-cap: 0*/
"use strict";
var express = require("express");

module.exports = {
	router: function() {
		var app = require("express").Router();
		app.get("/:schema/:table?", function(req, res) {
			var outString = '';
			require(global.__base + "router/routes/tables").getTables(req.params.schema, req.params.table, req.db, null, function(err, tablesJSON) {
				require("async").each(tablesJSON, function(table, callback) {
					require(global.__base + "router/routes/hdbcds").getHDBCDS(table.TABLE_OID.toString(), req.db, function(err, results) {
						if (err) {
							callback(err);
						} else {
							outString += results + '\n\n';
							callback();
						}
					});
				}, function(err) {
					if (err) {
						res.type("text/plain").status(500).send("ERROR: " + err);
					} else {
						res.header("Content-Disposition", "attachment; filename=ConversionHDBCDS.txt");
						res.type("application/octet-stream").status(200).send(outString);
					}
				});

			});
		});
		return app;
	}
};