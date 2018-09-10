/*eslint no-console: 0, no-unused-vars: 0, no-undef:0*/
/*eslint-env node, es6 */
"use strict";
module.exports = {
	initExpress: function () {
		let xsenv = require("@sap/xsenv");
		let passport = require("passport");
		let xssec = require("@sap/xssec");
		let xsHDBConn = require("@sap/hdbext");
		let express = require("express");

		//logging
		let logging = require("@sap/logging");
		var appContext = logging.createAppContext();

		//Initialize Express App for XS UAA and HDBEXT Middleware
		let app = express();
		passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
			uaa: {
				tag: "xsuaa"
			}
		}).uaa));
		app.use(logging.middleware({
			appContext: appContext,
			logNetwork: true
		}));
		app.use(passport.initialize());

		let options = xsenv.getServices({
			hana: "CROSS_SCHEMA_SYS"
		});
		//	options.hana.rowsWithMetadata = true;
		app.use(
			passport.authenticate("JWT", {
				session: false
			}),
			xsHDBConn.middleware(options.hana));
		return app;
	}
};