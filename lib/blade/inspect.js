/*!
 * Module dependencies.
 */

var events = require('events'),
    path = require('path');

/**
 * Inspects mobile apps
 *
 * Inspects apps downloaded form the marketplace
 *
 * Options:
 *
 *   - `options` {Object} is data required for inspecting apps
 *     - `e` {Error} is null unless there is an error.
 *
 * Events:
 *
 *   - `error` is trigger on an error.
 *     - `e` {Error} details the error.
 *   - `complete` is trigger when no error occurs.
 */

module.exports = function(options, callback) {
    // require options
    if (!options) throw new Error('requires option parameter');
    if (!options.platform) throw new Error('requires option.platform parameter');

    // optional callback
    callback = callback || function() {};

    // TODO: validate platform?

    // event support
    var emitter = new events.EventEmitter();
    emitter.on('error', callback);
    emitter.on('complete', function() {
        callback(null);
    });


    // inspect
    process.nextTick(function() {
        execute(options, emitter);
    });

    return emitter;
};



/*!
 * Execute.
 */

var execute = function(options, emitter) {

    //platform support
    switch(options.platform)
    {
    case 'ios':
        module.exports.inspect = require('./inspect/ios');
        break;
    default:
        module.exports.inspect = require('./inspect/some_error');
    }

    // create local project
    module.exports.inspect(function(e) {
        if (e) {
            emitter.emit('error', e);
            return;
        }

        emitter.emit('complete');
    });
};