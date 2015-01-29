/*!
 * koa.io - test/application.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var koa = require("../../lib/application");
var request = require("supertest");
var should = require("should");

function App() {
  var app = koa();
  app.keys = ["secrect"];

  app._initWebSocket();
  return app;
};

describe("lib/application", function () {

  describe("app", function () {

    it("should be instance of koa", function () {

      var app = App();
      (app instanceof require("koa")).should.be.ok;
    });
  });

  describe("app.io", function () {
    it("should be instanceof of socket.io", function () {
      var app = App();
      (app.io instanceof require("socket.io")).should.be.ok;
    });
  });

  describe("app.keys=", function () {
    it("should set app.io.keys", function () {
      var app = App();
      app.keys = ["foo"];
      app.io.keys.should.eql(["foo"]);
      app._keys.should.eql(["foo"]);
    });
  });

  describe("keys", function () {
    it("should get app._keys", function () {
      var app = App();
      app.keys = ["foo"];
      app.keys.should.equal(app._keys);
    });
  });

  describe("app.proxy=", function () {
    it("should set app.io.proxy", function () {
      var app = App();
      app.proxy = true;
      app.io.proxy.should.be.true;
      app._proxy.should.be.true;
    });
  });

  describe("proxy", function () {
    it("should get app._proxy", function () {
      var app = App();
      app.proxy = true;
      app.proxy.should.equal(app._proxy);
    });
  });
});