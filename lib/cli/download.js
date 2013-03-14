/*!
 * Module dependencies.
 */

var console = require('./console');

/**
 * Command line download command.
 *
 * For now, just inject 'ios' as platform and call download.
 *
 * Options:
 *
 *   - `argv` {Object} is an optimist object.
 *   - `callback` {Function} is a completion callback.
 *     - `e` {Error} is null unless there was an error.
 */

module.exports = function(argv, callback) {
    var self = this;

    // display help on $ blade inspect
    if (argv._.length <= 1) {
        self.help.download(argv, callback);
        return;
    }

    //Inject platform (add support if a new platform becomes availible)
    var data = {
        'platform': 'ios',
        'arg': [argv._[1]]
    };

    // inspect apps
    self.blade.download(data, function(e) {
        if (e) {
            console.error('failed to inspect:', e.message);
        }
        else {
            console.log('download success:', data.path);
        }

        callback(e);
    });
};
