/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, consistent-return: 0, new-cap: 0, no-empty:0*/
"use strict";

function getTablesFields(tableOid, client, callback) {
	var tableJSON = {};
	var fieldsJSON = {};
	require("async").parallel([

			function(cb) {
				require(global.__base + "router/routes/table").getTable(tableOid, client, function(err, results) {
					if (err) {
						cb(err);
					} else {
						tableJSON = results;
						cb();
					}
				});
			},
			function(cb) {
				require(global.__base + "router/routes/fields").getFields(tableOid, client, function(err, results) {
					if (err) {
						cb(err);
					} else {
						fieldsJSON = results;
						cb();
					}
				});
			}
		],
		function(err) {
			if (err) {
				callback(err);
			} else {
				if (tableJSON[0].HAS_PRIMARY_KEY === 'TRUE') {
					require(global.__base + "router/routes/constraints").getConstraints(tableJSON[0].SCHEMA_NAME, tableJSON[0].TABLE_NAME, client,
						function(err, constraintsJSON) {
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
	var cdstable = '';

	cdstable += 'Entity ' + tableJSON[0].TABLE_NAME + ' { \n';

	var isKey = 'FALSE';
	for (var i = 0; i < fieldsJSON.length; i++) {
		cdstable += '\t';
		isKey = 'FALSE';
		if (tableJSON[0].HAS_PRIMARY_KEY === 'TRUE') {
			for (var i2 = 0; i2 < constraintsJSON.length; i2++) {
				if (fieldsJSON[i].COLUMN_NAME === constraintsJSON[i2].COLUMN_NAME) {
					cdstable += 'key ';
					isKey = 'TRUE';
				}
			}
		}

		cdstable += fieldsJSON[i].COLUMN_NAME + ': ';

		switch (fieldsJSON[i].DATA_TYPE_NAME) {
			case "NVARCHAR":
				cdstable += 'String(' + fieldsJSON[i].LENGTH + ')';
				break;
			case "VARCHAR":
				cdstable += 'String(' + fieldsJSON[i].LENGTH + ')';
				break;
			case "NCLOB":
				cdstable += 'LargeString';
				break;
			case "VARBINARY":
				cdstable += 'Binary(' + fieldsJSON[i].LENGTH + ')';
				break;
			case "BLOB":
				cdstable += 'LargeBinary';
				break;
			case "INTEGER":
				cdstable += 'Integer';
				break;
			case "BIGINT":
				cdstable += 'Integer64';
				break;
			case "DECIMAL":
				cdstable += 'Decimal(' + fieldsJSON[i].LENGTH + ', ' + fieldsJSON[i].SCALE + ')';
				break;
			case "DOUBLE":
				cdstable += 'BinaryFloat';
				break;
			case "DATE":
				cdstable += 'LocalDate';
				break;
			case "TIME":
				cdstable += 'LocalTime';
				break;
			case "SECONDDATE":
				cdstable += 'UTCDateTime';
				break;
			case "TIMESTAMP":
				cdstable += 'UTCTimestamp';
				break;
			default:
				cdstable += 'hana.' + fieldsJSON[i].DATA_TYPE_NAME;
				//cdstable += '**UNSUPPORTED TYPE - ' + fieldsJSON[i].DATA_TYPE_NAME;

		}

		if (fieldsJSON[i].DEFAULT_VALUE) {
			cdstable += ' default "' + fieldsJSON[i].DEFAULT_VALUE + '"';
		}

		if (fieldsJSON[i].IS_NULLABLE === 'FALSE') {
			if (isKey === 'FALSE') {
				cdstable += ' not null';
			}
		} else {
			if (isKey === 'TRUE') {
				cdstable += ' null';
			}
		}
		cdstable += '; ';

		if (fieldsJSON[i].COMMENTS === null) {} else {
			cdstable += '// ' + fieldsJSON[i].COMMENTS;
		}

		cdstable += '\n';
	}
	cdstable += '}\n';
	cdstable += 'technical configuration { \n';

	if (tableJSON[0].IS_COLUMN_TABLE === 'TRUE') {
		cdstable += '\tcolumn store;\n';
	} else {
		cdstable += '\trow store;\n';
	}

	cdstable += '};\n';
	callback(null, cdstable);
}

function getHDBCDSInt(tableOid, client, callback) {
	if (typeof tableOid === "undefined" || tableOid === null) {
		callback("Invalid source table");
		return;
	}
	getTablesFields(tableOid, client, function(err, tableJSON, fieldsJSON, constraintsJSON) {
		if (err) {
			callback(err);
		} else {
			formatHDBCDS(tableJSON, fieldsJSON, constraintsJSON, callback);
		}
	});
}

module.exports = {
	getHDBCDS: function(tableOid, client, callback) {
		getHDBCDSInt(tableOid, client, callback);
	},

	router: function() {
		var app = require("express").Router();
		app.get("/:tableOid", function(req, res) {
			getHDBCDSInt(req.params.tableOid, req.db, function(err, results) {
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