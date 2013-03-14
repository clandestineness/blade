/**
 * Help commmand for download.
 *
 * Outputs the usage information for the download command.
 *
 * Options:
 *
 *   - `argv` {Object} is an optimist object.
 *   - `callback` {Function} is a completion callback.
 */

module.exports = function(argv, callback) {
    var help = [
        '',
        '  Usage: ' + argv.$0 + ' download <SearchTerm>',
        '',
        '  Synopsis:',
        '',
        '    Finds apps on the marketplace that coorispond to',
        '    the SearchTerm, and downloads them.',
        '',
        '  Example:',
        '',
        '    $ ' + argv.$0 + ' download utilities',
        ''
    ];

    console.log(help.join('\n'));

    callback(null);
};
