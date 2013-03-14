/**
 * Help command.
 *
 * Outputs the usage information for the command-line.
 *
 * Options:
 *
 *   - `argv` {Object} is an optimist object.
 *   - `callback` {Function} is null unless there is an error.
 */

module.exports = function(argv, callback) {
    // $ blade help <command>
    if (typeof this[argv._[0]][argv._[1]] === 'function') {
        this[argv._[0]][argv._[1]](argv, callback);
    }
    // $ blade help
    else {
        var help = [
            '',
            '  Usage: ' + argv.$0 + ' [options] [commands]',
            '',
            '  Synopsis:',
            '',
            '    Blade command-line tool.',
            '',
            '  Commands:',
            '',
            '    inspect              inpects downloaded apps',
            '    download             downloads apps',
            '',
            '  Options:',
            '',
            '    -v, --version        output version number',
            '    -h, --help           output usage information',
            '',
            '  Examples:',
            '',
            '    ' + argv.$0 + ' help download',
            '    ' + argv.$0 + ' inspect',
            ''
        ];

        console.log(help.join('\n'));
        callback(null);
    }
};
