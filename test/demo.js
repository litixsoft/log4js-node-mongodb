'use strict';

var lib = require('../lib');
var log4js = require('log4js');
var mongodb = require('mongodb');
var url = 'localhost:27017/test_log4js_mongo';

// logger
var appenders = [
    {
        type: 'console'
    },
    {
        type: 'log4js-node-mongodb',
        category: 'demo',
        level: 'DEBUG',
        connectionString: url
    }
];

mongodb.MongoClient.connect('mongodb://' + url, function (err, db) {
    if (err || !db) {
        return console.log(err || new Error('Unknown error, no database returned.'));
    }

    console.log('Successfully connected to MongoDb: %s', url);

    // clear
    var collection = db.collection('log');

    collection.removeMany({}, function () {
        log4js.addAppender(lib.configure(appenders[1]));
        var logger = log4js.getLogger('demo');
        var i = 500;

        for (var u = 0; u < i; u++) {
            logger.info(u);
        }

        var interval = setInterval(function () {
            logger.info(i);
            i++;
        }, 1);

        setTimeout(function () {
            clearInterval(interval);

            setTimeout(function () {
                db.close(function () {
                    process.exit(0);
                });
            }, 2000);
        }, 5000);
    });
});