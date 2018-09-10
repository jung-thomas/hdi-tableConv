/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";

function getTablesFields(tableOid, client, callback) {
	var tableJSON = {};
	var fieldsJSON = {};
	require("async").parallel([

			(cb) => {
				require(global.__base + "router/routes/table").getTable(tableOid, client, (err, results) => {
					if (err) {
						cb(err);
					} else {
						tableJSON = results;
						cb();
					}
				});
			},
			(cb) => {
				require(global.__base + "router/routes/fields").getFields(tableOid, client, (err, results) => {
					if (err) {
						cb(err);
					} else {
						fieldsJSON = results;
						cb();
					}
				});
			}
		],
		(err) => {
			if (err) {
				callback(err);
			} else {
				if (tableJSON[0].HAS_PRIMARY_KEY === "TRUE") {
					require(global.__base + "router/routes/constraints").getConstraints(tableJSON[0].SCHEMA_NAME, tableJSON[0].TABLE_NAME, client,
						(err, constraintsJSON) => {
							if (err) {
								callback(err);
							} else {
								callback(null, tableJSON, fieldsJSON, constraintsJSON);
							}
						});
				} else {
					callback(null, tableJSON, fieldsJSON, {});
				}
			}

		});
}

function formatHDBCDS(tableJSON, fieldsJSON, constraintsJSON, callback) {
	var cdstable = "";

	cdstable += `Entity ${tableJSON[0].TABLE_NAME}  { \n`;

	var isKey = "FALSE";
	for (let field of fieldsJSON){

		if (field.COMMENTS !== null){
			cdstable += "\t";
			cdstable += `@Comment: '${field.COMMENTS}'\n`;
		}

		isKey = "FALSE";
		if (tableJSON[0].HAS_PRIMARY_KEY === "TRUE") {
			for (let constraint of constraintsJSON) {
				if (field.COLUMN_NAME === constraint.COLUMN_NAME) {
					cdstable += "key ";
					isKey = "TRUE";
				}
			}
		}
		cdstable += "\t";
		cdstable += field.COLUMN_NAME + ": ";

		switch (field.DATA_TYPE_NAME) {
			case "NVARCHAR":
				cdstable += `String('${field.LENGTH}')`;
				break;
			case "VARCHAR":
				cdstable += `String('${field.LENGTH}')`;
				break;
			case "NCLOB":
				cdstable += "LargeString";
				break;
			case "VARBINARY":
				cdstable += `Binary('${field.LENGTH}')`;
				break;
			case "BLOB":
				cdstable += "LargeBinary";
				break;
			case "INTEGER":
				cdstable += "Integer";
				break;
			case "BIGINT":
				cdstable += "Integer64";
				break;
			case "DECIMAL":
				cdstable += `Decimal('${field.LENGTH}', '${field.SCALE}')`;
				break;
			case "DOUBLE":
				cdstable += "BinaryFloat";
				break;
			case "DATE":
				cdstable += "LocalDate";
				break;
			case "TIME":
				cdstable += "LocalTime";
				break;
			case "SECONDDATE":
				cdstable += "UTCDateTime";
				break;
			case "TIMESTAMP":
				cdstable += "UTCTimestamp";
				break;
			default:
				cdstable += `hana.${field.DATA_TYPE_NAME}`;
				//cdstable += '**UNSUPPORTED TYPE - ' + fieldsJSON[i].DATA_TYPE_NAME;

		}

		if (field.DEFAULT_VALUE) {
			cdstable += ` default "${field.DEFAULT_VALUE}"`;
		}

		if (field.IS_NULLABLE === "FALSE") {
			if (isKey === "FALSE") {
				cdstable += " not null";
			}
		} else {
			if (isKey === "TRUE") {
				cdstable += " null";
			}
		}
		cdstable += "; ";

		cdstable += "\n";
	}
	cdstable += "}\n";
	cdstable += "technical configuration { \n";

	if (tableJSON[0].IS_COLUMN_TABLE === "TRUE") {
		cdstable += "\tcolumn store;\n";
	} else {
		cdstable += "\trow store;\n";
	}

	cdstable += "};\n";
	callback(null, cdstable);
}

function getHDBCDSInt(tableOid, client, callback) {
	if (typeof tableOid === "undefined" || tableOid === null) {
		callback("Invalid source table");
		return;
	}
	getTablesFields(tableOid, client, (err, tableJSON, fieldsJSON, constraintsJSON) => {
		if (err) {
			callback(err);
		} else {
			formatHDBCDS(tableJSON, fieldsJSON, constraintsJSON, callback);
		}
	});
}

module.exports = {
	getHDBCDS: (tableOid, client, callback) => {
		getHDBCDSInt(tableOid, client, callback);
	},

	router: () => {
		var app = require("express").Router();
		app.get("/:tableOid", (req, res) => {
			getHDBCDSInt(req.params.tableOid, req.db, (err, results) => {
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