/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";

function getSchemasInt(schema, client, limit, callback) {
	if (typeof schema === "undefined" || schema === null) {
		schema = "%";
	} else {
		schema += "%";
	}

	var query = 
	    `SELECT * from SCHEMAS 
	      WHERE SCHEMA_NAME LIKE ? 
	      ORDER BY SCHEMA_NAME `;
	if (limit !== null) {
		query += `LIMIT ${limit.toString()}`;
	}
	client.prepare(
		query,
		(err, statement) => {
			statement.exec([schema],
				(err, results) => {
					if (err) {
						callback(err);
					} else {
						callback(null, results);
					}
				});
		});
}

module.exports = {
	getSchemas: (schema, client, limit, callback) => {
		getSchemasInt(schema, client, limit, callback);
	},

	router: () => {
		var app = require("express").Router();
		app.get("/:schema?", (req, res) => {
			getSchemasInt(req.params.schema, req.db, 200, (err, results) => {
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