"use strict";

process.env.NODE_ENV = "_sirendev";

var koa = require("koa");
var siren = require("../..");
var request = require("supertest");
var should = require("should");
var path = require("path");
var statuses = require("statuses");


describe("error", function() {
	
	it("should response error with custom page", function (done) {

    var app = siren({
    	basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:error:enabled", true);
        conf.set("env:env", "test");
      }
    });

    app.on("start", function () {

      app.use(function *(next) {

        this.throw(503, "Error");
      });

      app.removeListener("error", done);

      request(app.listen())
        .get("/")
        .expect(503, /Custom Error/, done);
    });

    app.on("error", done);
	});

  it("should response error with default page", function (done) {

    var app = siren({
      basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:error:enabled", true);
        conf.set("middleware:error:module:arguments", null);
        conf.set("env:env", "test");
      }
    });

    app.on("start", function () {

      app.use(function *(next) {

        this.throw(503);
      });

      app.removeListener("error", done);

      request(app.listen())
        .get("/")
        .set("Accept", "text/html")
        .expect(503, new RegExp(statuses[503]), done);
    });

    app.on("error", done);
  });

  it("should response error with default json", function (done) {

    var app = siren({
      basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:error:enabled", true);
        conf.set("env:env", "test");
      }
    });

    app.on("start", function () {

      app.use(function *(next) {

        this.throw(503);
      });

      app.removeListener("error", done);

      request(app.listen())
        .get("/")
        .set("Accept", "application/json")
        .expect(503, function (err, res) {

          if (err) {
            return done(err);
          }

          res.body.should.have.property("error", statuses[503]);
          done();
        });
    });

    app.on("error", done);
  });

  it("should response 500 in default", function (done) {

    var app = siren({
      basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:error:enabled", true);
        conf.set("env:env", "test");
      }
    });

    app.on("start", function () {

      app.use(function *(next) {

        this.throw("Error");
      });

      app.removeListener("error", done);

      request(app.listen())
        .get("/")
        .set("Accept", "text/plain")
        .expect(500, function (err, res) {

          if (err) {
            return done(err);
          }

          res.text.should.equal(statuses[500]);
          done();
        });
    });

    app.on("error", done);
  });

  it("should pass 404", function (done) {

    var app = siren({
      basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:error:enabled", true);
        conf.set("env:env", "test");
      }
    });

    app.on("start", function () {

      app.removeListener("error", done);

      request(app.listen())
        .get("/")
        .expect(404, done);
    });

    app.on("error", done);
  });
});