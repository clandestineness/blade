/*!
 * Module dependencies.
 */

var console = require('./console');

/**
 * Command line inspect command.
 *
 * For now, just inject 'ios' as platform and call inspect.
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
    /*if (argv._.length <= 1) {
        self.help.inspect(argv, callback);
        return;
    }*/

    //Inject platform (add support if a new platform becomes availible)
    var data = {
        platform: 'ios'
    };

    // inspect apps
    self.blade.inspect(data, function(e) {
        if (e) {
            console.error('failed to inspect:', e.message);
        }
        else {
            console.log('inspect success:', data.path);
        }

        callback(e);
    });
};
