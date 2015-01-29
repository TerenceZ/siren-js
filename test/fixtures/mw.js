/*!
 * koa.io - test/supports/middleware.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var client = require("./client");
var koa = require("../..");
var co = require("co");
var path = require("path");

module.exports = function middleware(fn) {

	var app = koa({
		basedir: path.join(__dirname, "..", "fixtures", "middleware")
	});

	return co(function *() {

		return yield function (done) {

			app.on("start", function () {
				app.io.use(fn);
				app.io.client = client(app);
				done(null, app);
			});

			app.on("error", function (error) {
				throw error;
			});
		};
	});
};