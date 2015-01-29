"use strict";

var koa = require("koa");
var util = require("util");
var http = require("http");
var assert = require("assert");
var Socket;


/**
 * Exports `Application`.
 */
module.exports = Application;


/**
 * Application constructor
 */
function Application() {

	if (!(this instanceof Application)) {
		return new Application();
	}

	koa.call(this);
}

util.inherits(Application, koa);

var app = Application.prototype;

/**
 * Initialize a socket.io instance.
 */
 app._initWebSocket = function _initWebSocket(options) {

 	assert(this.io === undefined, "cannot initialize websocket over and over");

 	this.io = (Socket || (Socket = require("./socket.io")))(options);
 	this.io.keys = this.keys;
 	this.io.proxy = this.proxy;
 };

/**
 * Get the keys for signed cookies.
 */
app.__defineGetter__("keys", function () {

	return this._keys;
});

/**
 * Set the keys for signed cookies.
 *
 * @param {Array} keys
 */
app.__defineSetter__("keys", function (keys) {

	this._keys = keys;

	if (this.io) {
		this.io.keys = keys;
	}
});

/**
 * Get the keys for signed cookies.
 */
app.__defineGetter__("keys", function () {

	return this._keys;
});

/**
 * Check for proxy.
 *
 * @param {Array} keys
 */
app.__defineGetter__("proxy", function () {

	return this._proxy;
});

/**
 * enable proxy.
 *
 * @param {Array} keys
 */
app.__defineSetter__("proxy", function (proxy) {

	this._proxy = proxy;

	if (this.io) {
		this.io.proxy = proxy;
	}
});

/**
 * Create a http server and attach socket.io to this server
 *
 * @return {Server}
 */
app.createServer = function () {

	var server = http.createServer(this.callback());

	if (this.io) {
		this.io.attach(server);
	}
	return server;
};

/**
 * Create a http server and attach socket.io to this server
 *
 * @param {Mixed} ...
 * @return {Server}
 */
app.listen = function () {

	var server = this.createServer();
	return server.listen.apply(server, arguments);
};