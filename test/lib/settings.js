"use strict";

process.env.NODE_ENV = "_sirendev";

var koa = require("../../lib/application");
var settings = require("../../lib/settings");
var should = require("should");
var path = require("path");
var co = require("co");

describe("settings", function () {

  var options = {
    basedir: path.join(path.dirname(__dirname), "fixtures", "settings"),
    a: {
      b: ["abc", function () {
        return "def";
      }, [{
        d: 20
      }]]
    }
  };

  it("should inject `siren` in app", function (done) {

    var app = koa();
    co(function *() {

      yield *settings(app, options);
      should.exists(app.siren);
      should.exists(app.settings);
      should.exists(app.context.settings);
      should.exists(app.keys);
      should.exists(app.proxy);
      app.proxy.should.be.false;
      app.env.should.equal(process.env.NODE_ENV);
      done();
    }).catch(done);
  });

  it("should init socket.io", function (done) {

    var app = koa();
    co(function *() {

      yield *settings(app, options);
      should.exists(app.io);
      app.io.should.be.instanceof(require("socket.io"));
      should.exists(app.io.keys);
      should.exists(app.io.proxy);
      done();
    }).catch(done);
  });

  it("should parse custom protocol", function (done) {

    var app = koa();
    co(function *() {

      yield *settings(app, {
        basedir: path.join(path.dirname(__dirname), "fixtures", "settings"),
        protocols: {
          custom: function (value) {

            return "Hello, " + value + "!";
          }
        },
        a: {
          b: ["abc", function () {
            return "def";
          }, [{
            d: 20
          }]]
        }
      });

      app.siren.get("foo").should.equal("baz");
      app.siren.get("click").should.equal("clack");
      app.siren.get("custom").should.equal("Hello, world!");
      should.deepEqual(app.siren.get("nestedA:nestedB:seasonals"), ["spring", "autumn", "summer", "winter"]);
      done();

    }).catch(function (e) {

      done(e);
    });
  });

  it("should resolve from config (shortstop-resolve)", function (done) {

    var app = koa();
    var basedir = path.join(path.dirname(__dirname), "fixtures", "settings");

    co(function *() {

      yield *settings(app, {
        basedir: basedir,
        a: {
          b: ["abc", function () {
            return "def";
          }, [{
            d: 20
          }]]
        }
      });

      var faviconPath = app.siren.get("middleware:favicon:module:arguments")[0];
      faviconPath.should.equal(path.join(basedir, "node_modules", "favicon", "icon.ico"));
      done();

    }).catch(function (e) {

      done(e);
    });
  });

  it("should resolve from options", function (done) {

    var app = koa();
    var basedir = path.join(path.dirname(__dirname), "fixtures", "settings");

    co(function *() {

      yield *settings(app, {
        basedir: basedir,
        a: {
          b: ["abc", function () {
            return "def";
          }, [{
            d: 20
          }]]
        }
      });

      app.siren.get("customOptions:ab0").should.equal("abc");
      app.siren.get("customOptions:ab1").should.equal("def");
      app.siren.get("customOptions:ab20d").should.equal(20);
      done();

    }).catch(function (e) {

      done(e);
    });
  });
});