/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";

function getTablesFields(tableOid, client, callback) {
	var tableJSON = {};
	require(global.__base + "router/routes/table").getTable(tableOid, client, (err, results) => {
		if (err) {
			callback(err);
		} else {
			tableJSON = results;
			callback(null, tableJSON);
		}
	});
}

function formatHDBTable(tableJSON, client, callback) {
	var hdbtable = "";
	var hdbext = require("@sap/hdbext");
	var inputParams = {
		SCHEMA: tableJSON[0].SCHEMA_NAME,
		OBJECT: tableJSON[0].TABLE_NAME
	};
	//(cleint, Schema, Procedure, callback)
	hdbext.loadProcedure(client, "SYS", "GET_OBJECT_DEFINITION", (err, sp) => {
		if (err) {
			callback(err);
			return;
		}
		//(Input Parameters, callback(errors, Output Scalar Parameters, [Output Table Parameters])
		sp(inputParams, (err, parameters, results) => {
			if (err) {
				callback(err);
				return;
			}
			hdbtable = results[0].OBJECT_CREATION_STATEMENT;
			hdbtable = hdbtable.toString();
			hdbtable = hdbtable.slice(7);
			hdbtable = hdbtable.replace("\"" + tableJSON[0].SCHEMA_NAME + "\".", "");
			
			hdbtable = hdbtable.replace(new RegExp(" ,", "g"), ",\n");			
			callback(null, hdbtable);
			return;
		});
	});
}

function getHDBTableInt(tableOid, client, callback) {
	if (typeof tableOid === "undefined" || tableOid === null) {
		callback("Invalid source table");
		return;
	}
	getTablesFields(tableOid, client, (err, tableJSON) => {
		if (err) {
			callback(err);
		} else {
			formatHDBTable(tableJSON, client, callback);
		}
	});
}

module.exports = {
	getHDBTable: (tableOid, client, callback) => {
		getHDBTableInt(tableOid, client, callback);
	},

	router: () => {
		var app = require("express").Router();
		app.get("/:tableOid", (req, res) => {
			getHDBTableInt(req.params.tableOid, req.db, (err, results) => {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err);
				} else {
					res.type("text/plain").status(200).send(results);
				}
			});
		});
		return app;
	}
};