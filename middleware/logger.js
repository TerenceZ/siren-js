"use strict";

var Logger = require("koa-logger");


module.exports = function (app, opts) {

	opts = opts || {};

	if (app.env === "production") {
		console.warn("This `logger` middleware is only for DEVELOPMENT.")
	}

	if (app.io) {
		var ns = opts.ns || ["/"];
		if (!Array.isArray(ns)) {
			ns = [ns];
		}

		ns.forEach(function () {

			this.io.of(ns).use(dev);
		}, app);		
	}
	return Logger();
};

/**
 * Development logger.
 */

function *dev(next) {

    // request
    var start = new Date;
    console.log('  \x1B[90m<-- \x1B[;1m%s\x1B[0;90m %s\x1B[0m', "WEBSOCKET", this.url);

    try {
      yield *next;
      log(this, start);
    } catch (err) {
      // log uncaught downstream errors
      log(this, start, err);
      throw err;
    }
}

/**
 * Log helper.
 */

function log(ctx, start, err) {

  var upstream = err ? '\x1B[31mxxx' : '\x1B[33m-x-';

  console.log('  ' + upstream + ' \x1B[;1mWEBSOCKET\x1B[0;90m %s \x1B[' + (err ? 31 : 32) + 'm%s\x1B[90m %s \x1B[0m',
    ctx.url,
    err ? "ERROR" : "OK",
    time(start));
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

function time(start) {
  var delta = new Date - start;
  delta = delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's';
  return delta;
}