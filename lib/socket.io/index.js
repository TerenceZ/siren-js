/*!
 * koa.io - lib/socket.io/index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var Namespace = require("socket.io/lib/namespace");
var ExtentNamespace = require("./namespace");
var Router = require("./router");

Namespace.prototype.route = ExtentNamespace.route;
Namespace.prototype.add = ExtentNamespace.add;
Namespace.prototype.use = ExtentNamespace.use;

Namespace.prototype.__defineGetter__("router", function () {

	return !this._router ?
		(this._router = new Router()) :
		this._router;
});

var Server = module.exports = require("socket.io");

Server.prototype.route = function () {
  return this.sockets.route.apply(this.sockets, arguments);
};