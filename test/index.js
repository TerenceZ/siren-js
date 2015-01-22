"use strict";

process.env.NODE_ENV = "_sirendev";

var koa = require("koa");
var siren = require("..");
var request = require("supertest");
var should = require("should");
var mount = require("siren-mount");
var co = require("co");


should.plan = function plan(number, done) {

  var plans = new Array(number);
  for (var i = -1; ++i < number;) {
    plans[i] = Promise.defer();
  }

  Promise.all(plans.map(function (defer) {

    return defer.promise;
  })).then(function () {

    done();

  }).catch(function (reason) {

    current = number;
    done(reason);
  });

  var current = -1;
  return {
    pass: function (err) {

      if (++current < number) {
        if (err) {
          plans[current].reject(err);
        } else {
          plans[current].resolve();
        }
      }
    },

    end: function (err) {

      if (err) {
        if (current + 1 < number) {
          plans[++current].reject(err);
        }
        return;
      }

      while (++current < number) {
        plans[current].resolve();
      }
    }
  };
};


describe("siren", function () {

  run("root", "", function (app) {

    return app;
  });
});


function run(name, path, decorate) {

  describe(name, function() {
    
    it("startup without options", function (done) {

      (function () {

        var app = decorate(siren());
        app.on("start", done);
        app.on("error", done);
      }).should.not.throw();
    });

    it("should startup with basedir", function (done) {

      (function () {

        var app = decorate(siren(__dirname));
        app.on("start", done);
        app.on("error", done);
      }).should.not.throw();
    });

    it("should startup with options", function (done) {

      (function () {

        var app = decorate(siren({
          basedir: __dirname
        }));

        app.on("start", done);
        app.on("error", done);
      }).should.not.throw();

    });

    it("should startup error", function (done) {

      var app = decorate(siren({
        onconfig: function *() {

          var error = new Error("fail");
          var defer = Promise.defer();
          setImmediate(function () {
            defer.reject(error);
          });         
          yield defer.promise;
        }
      }));

      app.on("start", function () {

        done(new Error("should not startup without error"));
      });

      app.on("error", function (err) {

        err.message.should.equal("fail");
        done();
      });
    });

    it("should shutdown", function (done) {

      var plan = should.plan(4, done);
      var pass = plan.pass.bind(plan);

      var exit = process.exit;
      var expected = 0;

      // because we are not about to exit really, so
      // this will fire twice, one for `code=0`, another
      // one for `code=1`. 
      process.exit = function (code) {

        code.should.equal(expected);
        plan.pass();

        expected++; 
        if (expected === 2) {
          process.exit = exit;
        }
      };

      var app = decorate(siren());

      app.on("start", function () {

        app.emit("shutdown", server, 200);
      });

      app.on("stop", function () {

        plan.pass();
      });

      var server = app.listen();
      server.timeout = 0;
    });
  });
}