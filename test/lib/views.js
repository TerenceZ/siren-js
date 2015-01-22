"use strict";

process.env.NODE_ENV = "_sirendev";

var koa = require("koa");
var should = require("should");
var path = require("path");
var settings = require("../../lib/settings");
var views = require("../../lib/views");
var request = require("supertest");
var co = require("co");


describe("views", function () {

  var options = {
    basedir: path.join(path.dirname(__dirname), "fixtures", "views")
  };

  it("should render jade template", function (done) {

    var app = koa();
    co(function *() {

      yield *settings(app, options);
      yield *views(app);

      app.use(function *() {

        this.state.title = "Views Test";

        yield *this.render("index", {
          condition: true
        });
      });

      request(app.listen())
        .get("/")
        .expect(200)
        .end(function (err, res) {

          if (err) {
            return done(err);
          }

          res.text.should.containEql("Views Test");
          res.text.should.containEql("Yes");
          done();
        });
    }).catch(function (e) {

      done(e);
    });
  });

  it("should render .html file using jade", function (done) {

    var app = koa();
    co(function *() {

      yield *settings(app, options);
      app.siren.set("view engines", {
        "html": "jade"
      })

      app.siren.set("app:view engine", null);
      yield *views(app);

      app.use(function *() {

        if (this.path === "/index2") {
          yield *this.render("index2");
        }
      });

      request(app.listen())
        .get("/index2")
        .expect(200)
        .expect("<div id=\"THIS_IS_INDEX_2\"></div>", done);
    }).catch(function (e) {

      done(e);
    });
  });
});