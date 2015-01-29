"use strict";

process.env.NODE_ENV = "_sirendev";

var siren = require("../..");
var request = require("supertest");
var should = require("should");
var path = require("path");


describe("404", function() {
	
	it("should response 404 with custom page", function (done) {

    var app = siren({
    	basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:404:enabled", true);
      }
    });

    app.on("start", function () {

      request(app.listen())
        .get("/foo")
        .expect(404, /Custom Page Not Found/, done);
    });

    app.on("error", done);
	});

  it("should response 404 with default html", function (done) {

    var app = siren({
      basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:404:enabled", true);
        conf.set("middleware:404:module:arguments", null);
      }
    });

    app.on("start", function () {

      request(app.listen())
        .get("/foo")
        .set("Accept", "text/html")
        .expect(404, "Page Not Found", done);
    });

    app.on("error", done);
  });

  it("should response 404 with json", function (done) {

    var app = siren({
      basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:404:enabled", true);
      }
    });

    app.on("start", function () {

      request(app.listen())
        .get("/foo")
        .set("Accept", "application/json")
        .expect(404, function (err, res) {

          if (err) {
            return done(err);
          }

          res.body.should.have.property("message", "Page Not Found");
          done();
        });
    });

    app.on("error", done);
  });

  it("should response 404 with text", function (done) {

    var app = siren({
      basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
      onconfig: function *(conf) {
        conf.set("middleware:custom", null);
        conf.set("middleware:custom2", null);
        conf.set("middleware:404:enabled", true);
      }
    });

    app.on("start", function () {

      request(app.listen())
        .get("/foo")
        .set("Accept", "text/plain")
        .expect(404, function (err, res) {

          if (err) {
            return done(err);
          }

          res.text.should.equal("Page Not Found");
          done();
        });
    });

    app.on("error", done);
  });
});