"use strict";

module.exports = function(app) {

	app.use("/rest/schemas", require("./routes/schemas").router());
	app.use("/rest/tables", require("./routes/tables").router());
	app.use("/rest/table", require("./routes/table").router());
	app.use("/rest/fields", require("./routes/fields").router());
	app.use("/rest/constraints", require("./routes/constraints").router());
	app.use("/rest/hdbcds", require("./routes/hdbcds").router());
	app.use("/rest/download", require("./routes/download").router());
	app.use("/rest/sessionInfo", require("./routes/sessionInfo").router());

};