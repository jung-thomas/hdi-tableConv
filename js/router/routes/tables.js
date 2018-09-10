/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";

function getTablesInt(schema, table, client, limit, callback) {
	if (typeof table === "undefined" || table === null) {
		table = "%";
	} else {
		table += "%";
	}

	var query =
		`SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
		  WHERE SCHEMA_NAME = ? 
		    AND TABLE_NAME LIKE ? 
		  ORDER BY TABLE_NAME `;
	if (limit !== null) {
		query += `LIMIT ${limit.toString()}`;
	}
	client.prepare(
		query,
		(err, statement) => {
			statement.exec([schema, table],
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
	getTables: (schema, table, client, limit, callback) => {
		getTablesInt(schema, table, client, limit, callback);
	},

	router: () => {
		var app = require("express").Router();
		app.get("/:schema/:table?", (req, res) => {
			getTablesInt(req.params.schema, req.params.table, req.db, 200, (err, results) => {
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