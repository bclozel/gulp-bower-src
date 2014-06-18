'use strict';
var es = require("event-stream");
var path = require("path");
var should = require("should");
var bowerSrc = require('../index');

describe('bowerSrc()', function () {

    function streamFromConfig(path) {
        return bowerSrc({
            paths: {
                bowerJson: __dirname + "/" + path,
                bowerrc: __dirname + "/.bowerrc"
            }
        });
    }

    function expect(filenames) {
        var expectedFiles = [].concat(filenames).map(function(filename) {
            return path.join(__dirname, filename);
        });

        function run(path, done) {
            var stream = streamFromConfig(path);
            var srcFiles = [];

            stream.on("end", function(){
                srcFiles.should.be.eql(expectedFiles);
                done();
            });

            stream.pipe(es.map(function(file, callback){
                srcFiles.push(file.path);
                callback();
            }));
        }

        return {
            fromConfig: function(path) {
                return {
                    when: function(done) { run(path, done); }
                }
            }
        }
    }

    it('should ignore the expected files', function (done) {
        expect([
            "/fixtures/simple",
            "/fixtures/simple/main.js",
            "/fixtures/overwritten",
            "/fixtures/overwritten/main.js",
            "/fixtures/empty",
            "/fixtures/empty/main.js"
        ]).fromConfig("simple.json").when(done);
    });

    it('should ignore empty folders as well', function (done) {
        expect([
            "/fixtures/emptyfolder",
            "/fixtures/emptyfolder/dist",
            "/fixtures/emptyfolder/dist/dist.js"
        ]).fromConfig("emptyfolder.json").when(done);
    });

    it("should throw an exception when using negate glob patterns in ignore", function(done) {
        try {
            streamFromConfig("negate.json");

            should.fail("due to the use of a negate glob pattern.");
        } catch (e) {
            e.message.should.containEql("does not support ignore glob patterns - please override ");
            done();
        }
    });

});