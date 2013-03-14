/*!
 * Module dependencies.
 */

var events = require('events'),
    path = require('path');

/**
 * Downloads apps from the marketplace.
 *
 * Automates downloading apps from the marketplace.
 *
 * Options:
 *
 *   - `options` {Object} is data required for downloading apps
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


    // download
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
        module.exports.download = require('./download/ios');
        break;
    default:
        module.exports.download = require('./download/some_error');
    }

    // start downloading
    module.exports.download(options.arg, function(e) {
        if (e) {
            emitter.emit('error', e);
            return;
        }

        emitter.emit('complete');
    });
};