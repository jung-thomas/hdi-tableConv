/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";
var express = require("express");

function getFieldsInt(tableOid, client, callback) {
	const query =
		`SELECT * from TABLE_COLUMNS
  	      WHERE TABLE_OID = ?
          ORDER BY POSITION `;
	client.prepare(
		query,
		(err, statement) => {
			statement.exec([tableOid],
				(err, results) => {
					if (err) {
						callback(err);
					} else {
						let out = [];
						for (let result of results){
							out.push(result);
						}
						callback(null, out);
					}
				});
		});
}

module.exports = {
	getFields: (tableOid, client, callback) => {
		getFieldsInt(tableOid, client, callback);
	},

	router: () => {
		var app = require("express").Router();
		app.get("/:tableOid", (req, res) => {
			getFieldsInt(req.params.tableOid, req.db, (err, results) => {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err);
				} else {
					require(global.__base + "utils/json").outputJSON(results, res);
				}
			});
		});

		return app;
	}
};