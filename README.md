# log4js-node-mongodb

> A log4js-node log appender to write logs into MongoDB.

> [![Build Status](https://travis-ci.org/litixsoft/log4js-node-mongodb.svg?branch=master)](https://travis-ci.org/litixsoft/log4js-node-mongodb) [![david-dm](https://david-dm.org/litixsoft/log4js-node-mongodb.svg)](https://david-dm.org/litixsoft/log4js-node-mongodb/) [![david-dm](https://david-dm.org/litixsoft/log4js-node-mongodb/dev-status.svg)](https://david-dm.org/litixsoft/log4js-node-mongodb#info=devDependencies&view=table)

## Install

[![NPM](https://nodei.co/npm/log4js-node-mongodb.png?downloads=true&stars=true)](https://nodei.co/npm/log4js-node-mongodb/)

## Documentation

You can use this appender like all other log4js-node appenders. It just needs the connection-string to the mongo db. ([mongodb connection-string doku](http://docs.mongodb.org/manual/reference/connection-string/))
The default collection used is log. You can log a `string` or any kind of `object`. The objects are stored as they are and not converted to strings.

```js
var log4js = require('log4js'),
    mongoAppender = require('log4js-node-mongodb');

log4js.addAppender(
    mongoAppender.appender({connectionString: 'localhost:27017/logs'}),
    'cheese'
);

var logger = log4js.getLogger('cheese');
logger.trace('Entering cheese testing');
logger.debug('Got cheese.');
logger.info('Cheese is Gouda.');
logger.warn('Cheese is quite smelly.');
logger.error('Cheese is too ripe!');
logger.fatal('Cheese was breeding ground for listeria.');

// log objects
logger.info({id: 1, name: &#39;wayne&#39;});
logger.info([1, 2, 3]);
```

Or you can use the configure method.

```js
var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'log4js-node-mongodb',
            connectionString: 'localhost:27017/logs',
            category: 'cheese'
        }
    ]
});
```

The log data is stored in the following format.

```js
{
    _id: ObjectID,
    timestamp: loggingEvent.startTime,
    data: loggingEvent.data,
    level: loggingEvent.level,
    category: loggingEvent.logger.category
}
```

Here some examples.

```js
var log4js = require('log4js'),
    mongoAppender = require('log4js-node-mongodb');

log4js.addAppender(
    mongoAppender.appender(
        {connectionString: 'localhost:27017/logs'}),
    'audit'
);

var logger = log4js.getLogger('audit');
logger.debug('Hello %s, your are the %d user logged in!', 'wayne', 10);

// saved as
{
    _id: new ObjectID(),
    timestamp: new Date(),
    data: 'Hello wayne, your are the 10 user logged in!',
    level: {
        level: 10000,
        levelStr: 'DEBUG'
    },
    category: 'audit'
}

logger.info({id: 1, name: 'wayne'});

// saved as
{
    _id: new ObjectID(),
    timestamp: new Date(),
    data: {
        id: 1,
        name: 'wayne'
    },
    level: {
        level: 20000,
        levelStr: 'INFO'
    },
    category: 'audit'
}
```

### Configuration
There are some options which can by set through the config object.

#### connectionString
The connection-string to the mongo db.

* | *
--- | ---
Type | `string`
Required | `true`
Default value |

```js
var log4js = require('log4js'),
    mongoAppender = require('log4js-node-mongodb');

log4js.addAppender(
    mongoAppender.appender({connectionString: 'localhost:27017/logs'}),
    'cheese'
);
```

#### collectionName
The name of the mongo db collection where the logs are stored.

* | *
--- | ---
Type | `string`
Required | `false`
Default value | `'log'`

```js
var log4js = require('log4js'),
    mongoAppender = require('log4js-node-mongodb');

log4js.addAppender(
    mongoAppender.appender({
        connectionString: 'localhost:27017/logs',
        collectionName: 'audit'
    }),
    'cheese'
);
```

#### write
The write mode of the mongo db insert operation. With this option you have control over the [write concern](http://docs.mongodb.org/manual/core/write-concern/) of mongo db.

* | *
--- | ---
Type | `string`
Required | `false`
Default value | `'fast'`

There are 3 options available. The default value is 'fast'.

* | mongo options object | error logging
--- | --- | ---
fast | `{w: 0}` | `no`
normal | `{w: 1}` | `yes`
safe | `{w: 1, journal: true}` | `yes`

```js
var log4js = require('log4js'),
    mongoAppender = require('log4js-node-mongodb');

// fast write mode
log4js.addAppender(
    mongoAppender.appender({connectionString: 'localhost:27017/logs'},
    'cheese'
);

// normal write mode
log4js.addAppender(
    mongoAppender.appender({
        connectionString: 'localhost:27017/logs',
        write: 'normal'
    },
    'cheese'
);

// safe write mode
log4js.addAppender(
    mongoAppender.appender({
        connectionString: 'localhost:27017/logs',
        write: 'safe'
    },
    'cheese'
);
```

#### layout
The log4js-node layout which is used when logging a string. ([log4js-node layouts](https://github.com/nomiddlename/log4js-node/wiki/Layouts))

* | *
--- | ---
Type | `string`
Required | `false`
Default value | `'messagePassThroughLayout'`

```js
var log4js = require('log4js'),
    mongoAppender = require('log4js-node-mongodb');

log4js.addAppender(
    mongoAppender.appender({
        connectionString: 'localhost:27017/logs',
        layout: 'colored'
    },
    'cheese'
);
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

## Release History
### v1.0.0
* add support for MongoDB 3.x

### v0.1.5
* wrap Errors in a new object because otherwhise they are saved as an empty object {}

### v0.1.4
* Errors are now saved as string (previously saved as empty object)

### v0.1.3
* Date and Regexp objects are now saved correctly (previously saved as {})

### v0.1.2
* replace keys when logging an object to prevent mongo exception
* $ is converted to "_dollar_" (only replaced at start of key)
* . is converted to "_dot_" (all occurrences are replaced)

### v0.1.1
* Safely check if the log message is a string

### v0.1.0 project initial

## Author
[Litixsoft GmbH](http://www.litixsoft.de)

## License
Copyright (C) 2013-2015 Litixsoft GmbH <info@litixsoft.de>
Licensed under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
