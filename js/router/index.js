"use strict";

module.exports = function(app) {
<<<<<<< HEAD
	app.use("/rest/schemas", require("./routes/schemas").router());
	app.use("/rest/tables", require("./routes/tables").router());
	app.use("/rest/table", require("./routes/table").router());
	app.use("/rest/fields", require("./routes/fields").router());
	app.use("/rest/constraints", require("./routes/constraints").router());
	app.use("/rest/hdbcds", require("./routes/hdbcds").router());
	app.use("/rest/download", require("./routes/download").router());
	app.use("/rest/sessionInfo", require("./routes/sessionInfo").router());
=======
	app.use("/node/schemas", require("./routes/schemas").router());
	app.use("/node/tables", require("./routes/tables").router());
	app.use("/node/table", require("./routes/table").router());
	app.use("/node/fields", require("./routes/fields").router());
	app.use("/node/constraints", require("./routes/constraints").router());
	app.use("/node/hdbcds", require("./routes/hdbcds").router());
	app.use("/node/download", require("./routes/download").router());
	app.use("/node/sessionInfo", require("./routes/sessionInfo").router());
>>>>>>> refs/remotes/origin/master
};