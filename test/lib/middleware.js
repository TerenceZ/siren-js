"use strict";

process.env.NODE_ENV = "_sirendev";

var koa = require("koa");
var settings = require("../../lib/settings");
var middleware = require("../../lib/middleware");
var request = require("supertest");
var should = require("should");
var path = require("path");
var co = require("co");

describe("middleware", function () {

  var options = {
    basedir: path.join(path.dirname(__dirname), "fixtures", "middleware")
  };

  it("should load no middleware", function (done) {

    var app = koa();
    co(function *() {

      yield *settings(app, options);
      app.siren.set("middleware", null);
      yield *middleware(app);
      done();
    }).catch (function (e) {

      done(e);
    });
  });

  it("should load middleware", function (done) {

    var app = koa();
    var value = 0;
    co(function *() {

      yield *settings(app, options);
      yield *middleware(app);

      value.should.equal(1111);

      request(app.listen())
        .get("/")
        .expect(200)
        .end(function (err, res) {

          if (err) {
            return done(err);
          }
          res.body.a.should.equal(1);
          res.body.b.should.equal(2);
          done();
        });
    }).catch (function (e) {

      done(e);
    });

    app.once("middleware:before", function () {
      value += 1;
    });

    app.on("middleware:before:custom2", function () {
      value += 10;
    });

    app.on("middleware:after:custom2", function () {
      value += 100;
    });

    app.once("middleware:after", function onmiddlewareafter() {
      value += 1000;
    });
  });
});