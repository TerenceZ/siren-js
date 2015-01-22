"use strict";

process.env.NODE_ENV = "_sirendev";

var koa = require("koa");
var siren = require("../..");
var request = require("supertest");
var should = require("should");
var path = require("path");


describe("shutdown", function() {
	
	it("should response 503 with shutdown message", function (done) {

    var exit = process.exit;
    var expected = 0;
    var planSize = 5;

    function complete(end) {

      if (end || !--planSize) {
        done(end === true ? null : end);
      }
    }

    // because we are not about to exit really, so
    // this will fire twice, one for `code=0`, another
    // one for `code=1`. 
    process.exit = function (code) {

      code.should.equal(expected);
      expected++;
      complete();

      if (expected === 2) {
        process.exit = exit;
      }
    };

    var app = siren({
    	basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:shutdown:enabled", true);
        conf.set("middleware:shutdown:module:arguments", ["__app"]);
      }
    });

    app.on("start", function () {

      var server = app.listen();
      server.timeout = 0;

      app.emit("shutdown", server, 200);
      complete();

      request(server)
        .get("/")
        .expect(503, "server is shutting down.", complete);
    });

    app.on("error", function (err) {

      complete(err);
    });

    app.on("stop", function () {

      complete();
    });
	});

  it("should response 503 with custom shutdown template", function (done) {

    var exit = process.exit;
    var expected = 0;
    var planSize = 5;

    function complete(end) {

      if (end || !--planSize) {
        done(end === true ? null : end);
      }
    }

    // because we are not about to exit really, so
    // this will fire twice, one for `code=0`, another
    // one for `code=1`. 
    process.exit = function (code) {

      code.should.equal(expected);
      expected++;
      complete();

      if (expected === 2) {
        process.exit = exit;
      }
    };

    var app = siren({
      basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:shutdown:enabled", true);
      }
    });

    app.on("start", function () {

      var server = app.listen();
      server.timeout = 0;

      app.emit("shutdown", server, 200);
      complete();

      request(server)
        .get("/")
        .expect(503, /Custom Shutdown/, complete);
    });

    app.on("error", function (err) {

      complete(err);
    });

    app.on("stop", function () {

      complete();
    });
  });
});