var log4js = require('log4js');
var mongojs = require('mongojs');
var lxHelpers = require('lx-helpers');

/**
 * Returns a function to log data in mongodb.
 *
 * @param {Object} config The configuration object.
 * @param {string} config.connectionString The connection string to the mongo db.
 * @param {string=} config.layout The log4js layout.
 * @param {string=} config.write The write mode.
 * @returns {Function}
 */
function mongodbAppender (config) {
    if (!config || !config.connectionString) {
        throw new Error('connectionString is missing. Cannot connect to mongdb.');
    }

    function ERROR (err) {
        Error.call(this);
        Error.captureStackTrace(this, this.constructor);

        this.name = err.toString();
        this.message = err.message || 'error';
    }

    function replaceKeys (src) {
        var result = {};

        function mixin (dest, source, cloneFunc) {
            if (lxHelpers.isObject(source)) {
                lxHelpers.forEach(source, function (value, key) {
                    // replace $ at start
                    if (key[0] === '$') {
                        key = key.replace('$', '_dollar_');
                    }

                    // replace all dots
                    key = key.replace(/\./g, '_dot_');

                    dest[key] = cloneFunc ? cloneFunc(value) : value;
                });
            }

            return dest;
        }

        if (!src || typeof src !== 'object' || typeof src === 'function' || src instanceof Date || src instanceof RegExp) {
            return src;
        }

        // wrap Errors in a new object because otherwise they are saved as an empty object {}
        if (lxHelpers.getType(src) === 'error') {
            return new ERROR(src);
        }

        // Array
        if (lxHelpers.isArray(src)) {
            result = [];

            lxHelpers.arrayForEach(src, function (item) {
                result.push(replaceKeys(item));
            });
        }

        return mixin(result, src, replaceKeys);
    }

    var layout = config.layout || log4js.layouts.messagePassThroughLayout,
        collectionName = config.collectionName || 'log',
        db = mongojs(config.connectionString, [collectionName]),
        collection = db[collectionName],
        options = {w: 0};

    if (config.write === 'normal') {
        options.w = 1;
    }

    if (config.write === 'safe') {
        options.w = 1;
        options.journal = true;
    }

    return function (loggingEvent) {
        // get the information to log
        if (Object.prototype.toString.call(loggingEvent.data[0]) === '[object String]') {
            // format string with layout
            loggingEvent.data = layout(loggingEvent);
        } else if (loggingEvent.data.length === 1) {
            loggingEvent.data = loggingEvent.data[0];
        }

        loggingEvent.data = replaceKeys(loggingEvent.data);

        if (collection) {
            if (options.w === 0) {
                // fast write
                collection.insert({
                    timestamp: loggingEvent.startTime,
                    data: loggingEvent.data,
                    level: loggingEvent.level,
                    category: loggingEvent.logger.category
                }, options);
            } else {
                // save write
                collection.insert({
                    timestamp: loggingEvent.startTime,
                    data: loggingEvent.data,
                    level: loggingEvent.level,
                    category: loggingEvent.logger.category
                }, options, function (error) {
                    if (error) {
                        console.error('log: Error writing data to log!');
                        console.error(error);
                        console.log('log: Connection: %s, collection: %, data: %j', config.connectionString, collectionName, loggingEvent);
                    }
                });
            }
        }
    };
}

function configure (config) {
    if (config.layout) {
        config.layout = log4js.layouts.layout(config.layout.type, config.layout);
    }

    return mongodbAppender(config);
}

exports.appender = mongodbAppender;
exports.configure = configure;
