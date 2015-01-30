"use strict";

var Session = require("koa-generic-session");


module.exports = function (app, opts) {

	opts = opts || {};
	var session = Session(opts);

	if (app.io) {
		var ns = opts.ns || ["/"];
		if (!Array.isArray(ns)) {
			ns = [ns];
		}

		ns.forEach(function () {

			this.io.of(ns).use(session);
		}, app);		
	}

	return session;
};