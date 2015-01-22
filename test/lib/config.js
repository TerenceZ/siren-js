"use strict";

process.env.NODE_ENV = "_sirendev";

var co = require("co");
var path = require("path");
var should = require("should");
var config = require("../../lib/config");


describe("config", function() {
  
  var options = {
    basedir: path.join(path.dirname(__dirname), "fixtures", "config")
  };

  it("should load default config", function (done) {

    co(function *() {

      var conf = yield *config(options);
      conf.get("default-variable").should.equal("default");
      conf.get("nested:c").should.equal("c");
      done();
    }).catch(function (e) {

      done(e);
    });
  });

  it("should merge default config and test config", function (done) {

    co(function *() {

      var conf = yield *config(options);
      conf.get("test-variable").should.equal("test");
      conf.get("variable").should.equal("test");
      conf.get("nested:a").should.equal("test");
      conf.get("nested:b").should.equal("b");
      conf.get("nested:c").should.equal("c");
      done();
    }).catch(function (e) {

      done(e);
    });
  });
});