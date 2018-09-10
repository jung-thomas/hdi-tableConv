/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";

function getConstraintsInt(schema, table, client, callback) {

	if (typeof schema === "undefined" || schema === null) {
		callback("Invalid search schema");
		return;
	}
	if (typeof table === "undefined" || table === null) {
		callback("Invalid search table");
		return;
	}

	const query =
		`SELECT * from CONSTRAINTS 
	      WHERE SCHEMA_NAME = ? 
	        AND TABLE_NAME = ? 
	        AND IS_PRIMARY_KEY = ? 
	      ORDER BY POSITION `;
	client.prepare(
		query,
		(err, statement) => {
			statement.exec([schema, table, "TRUE"],
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
	getConstraints: (schema, table, client, callback) => {
		getConstraintsInt(schema, table, client, callback);
	},

	router: () => {
		var app = require("express").Router();
		app.get("/:schema?/:table?", (req, res) => {
			getConstraintsInt(req.params.schema, req.params.table, req.db, (err, results) => {
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