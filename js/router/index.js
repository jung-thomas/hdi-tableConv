/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";

module.exports = (app) => {

	app.use("/rest/schemas", require("./routes/schemas").router());
	app.use("/rest/tables", require("./routes/tables").router());
	app.use("/rest/table", require("./routes/table").router());
	app.use("/rest/fields", require("./routes/fields").router());
	app.use("/rest/constraints", require("./routes/constraints").router());
	app.use("/rest/hdbcds", require("./routes/hdbcds").router());
	app.use("/rest/hdbtable", require("./routes/hdbtable").router());	
	app.use("/rest/download", require("./routes/download").router());
	app.use("/rest/sessionInfo", require("./routes/sessionInfo").router());

};