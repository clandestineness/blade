/**
 * Help commmand for inspect.
 *
 * Outputs the usage information for the inspect command.
 *
 * Options:
 *
 *   - `argv` {Object} is an optimist object.
 *   - `callback` {Function} is a completion callback.
 */

module.exports = function(argv, callback) {
    var help = [
        '',
        '  Usage: ' + argv.$0 + ' inspect',
        '',
        '  Synopsis:',
        '',
        '    Unpacks downloaded apps and checks the contents for the match targets',
        '',
        '  Example:',
        '',
        '    $ ' + argv.$0 + ' inspect',
        ''
    ];

    console.log(help.join('\n'));

    callback(null);
};