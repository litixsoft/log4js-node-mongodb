/*global describe, it, expect, beforeEach */
'use strict';

var log4js = require('log4js');
var mongodb = require('mongodb');
var sut = require('../../lib/index');
var connectionString = 'mongodb://localhost:27017/test_log4js_mongo?w=0';
var db;

describe('log4js-node-mongoappender', function () {
    beforeEach(function (done) {
        log4js.clearAppenders();

        if (db) {
            db.collection('log').drop(function () {
                db.collection('audit').drop(function () {
                    done();
                });
            });
        } else {
            mongodb.MongoClient.connect(connectionString, function (err, database) {
                //var db = mongojs(connectionString, ['log', 'audit']);
                db = database;

                db.collection('log').drop(function () {
                    db.collection('audit').drop(function () {
                        done();
                    });
                });
            });
        }
    });

    it('should be initialized correctly', function () {
        expect(typeof sut.configure).toBe('function');
        expect(typeof sut.appender).toBe('function');
    });

    it('should throw an Error when the connectionString is not set', function () {
        expect(function () { return log4js.addAppender(sut.appender()); }).toThrow();
    });

    it('should log to the mongo database when initialized through the configure function', function (done) {
        log4js.addAppender(sut.configure({ connectionString: 'localhost:27017/test_log4js_mongo' }));
        log4js.getLogger().info('Ready to log!');
        log4js.getLogger().debug({ a: 1 });

        var id = new mongodb.ObjectID();
        log4js.getLogger().error({ _id: id });

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(3);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO' });
                expect(res[1].data).toEqual({ a: 1 });
                expect(res[1].level).toEqual({ level: 10000, levelStr: 'DEBUG' });
                expect(res[2].data._id.toString()).toEqual(id.toString());
                expect(res[2].data._id instanceof mongodb.ObjectID).toBeTruthy();
                expect(res[2].level).toEqual({ level: 40000, levelStr: 'ERROR' });

                done();
            });
        }, 1500);
    });

    it('should log an object to the mongo database when initialized through the configure function', function (done) {
        log4js.addAppender(sut.configure({ connectionString: 'localhost:27017/test_log4js_mongo' }));
        log4js.getLogger().info({ ok: 1, date: new Date(), regex: new RegExp('aaa', 'i') });

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data.ok).toBe(1);
                expect(res[0].data.date instanceof Date).toBeTruthy();
                expect(res[0].data.regex instanceof RegExp).toBeTruthy();
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO' });

                done();
            });
        }, 500);
    });

    it('should log an error object to the mongo database when initialized through the configure function', function (done) {
        var error = new Error('wayne');
        log4js.addAppender(sut.configure({ connectionString: 'localhost:27017/test_log4js_mongo' }));
        log4js.getLogger().warn(error);

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toEqual({ name: 'Error: wayne', message: 'wayne' });
                expect(res[0].level).toEqual({ level: 30000, levelStr: 'WARN' });
                expect(error instanceof Error).toBeTruthy();

                done();
            });
        }, 500);
    });

    it('should log an object to the mongo database and replace keys that contains $ or .', function (done) {
        log4js.addAppender(sut.configure({ connectionString: 'localhost:27017/test_log4js_mongo' }));
        log4js.getLogger().info({ $and: [{ 'a.d': 3 }, { $or: { a: 1 } }], 'test.1.2': 5 });

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toEqual({ _dollar_and: [{ a_dot_d: 3 }, { _dollar_or: { a: 1 } }], test_dot_1_dot_2: 5 });
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO' });

                done();
            });
        }, 500);
    });

    it('should log to the mongo database with a given layout', function (done) {
        log4js.addAppender(sut.configure({ connectionString: 'localhost:27017/test_log4js_mongo', layout: 'colored' }));
        log4js.getLogger().info('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO' });

                done();
            });
        }, 100);
    });

    it('should log to the mongo database given connection options', function (done) {
      log4js.addAppender(sut.configure({ connectionString: 'localhost:27017/test_log4js_mongo', connectionOptions: {server: {ssl: false, sslValidate: false}} }));
      log4js.getLogger().info('Ready to log!');

      setTimeout(function () {
          db.collection('log').find({}).toArray(function (err, res) {
              expect(err).toBeNull();
              expect(res.length).toBe(1);
              expect(res[0].category).toBe('[default]');
              expect(res[0].data).toBe('Ready to log!');
              expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO' });

              done();
          });
      }, 100);
    });

    it('should log to the mongo database with category [default]', function (done) {
        log4js.addAppender(sut.appender({ connectionString: 'localhost:27017/test_log4js_mongo' }));
        log4js.getLogger().info('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO' });

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with a category', function (done) {
        log4js.addAppender(sut.appender({ connectionString: 'localhost:27017/test_log4js_mongo' }), 'demo');
        log4js.getLogger('demo').warn({ id: 1, name: 'test' });

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('demo');
                expect(res[0].data).toEqual({ id: 1, name: 'test' });
                expect(res[0].level).toEqual({ level: 30000, levelStr: 'WARN' });

                done();
            });
        }, 100);
    });

    //it('should log to the mongo database with a given collection', function (done) {
    //    var db = mongojs(connectionString, ['audit']);
    //    log4js.addAppender(sut.appender({connectionString: 'localhost:27017/test_log4js_mongo', collectionName: 'audit'}), 'demo');
    //    log4js.getLogger('demo').error({id: 1, name: 'test'});
    //
    //    setTimeout(function () {
    //        db.collection('audit').find({}, function (err, res) {
    //            expect(err).toBeNull();
    //            expect(res.length).toBe(1);
    //            expect(res[0].category).toBe('demo');
    //            expect(res[0].data).toEqual({id: 1, name: 'test'});
    //            expect(res[0].level).toEqual({level: 40000, levelStr: 'ERROR'});
    //
    //            done();
    //        });
    //    }, 1000);
    //});

    it('should log to the mongo database with write mode "normal"', function (done) {
        log4js.addAppender(sut.appender({ connectionString: 'localhost:27017/test_log4js_mongo', write: 'normal' }));
        log4js.getLogger().fatal('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 50000, levelStr: 'FATAL' });

                done();
            });
        }, 1000);
    });

    it('should log to the mongo database with write mode "safe"', function (done) {
        log4js.addAppender(sut.appender({ connectionString: 'localhost:27017/test_log4js_mongo', write: 'safe' }));
        log4js.getLogger().debug('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 10000, levelStr: 'DEBUG' });

                done();
            });
        }, 1000);
    });
});