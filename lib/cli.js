/*
 * Module dependencies.
 */

var Blade = require('./blade');


/**
 * Command line interface object.
 */

function CLI() {
    this.blade = new Blade();
}

/**
 * Command line commands.
 */

CLI.prototype.argv = require('./cli/argv');
CLI.prototype.unknown = require('./cli/unknown');
CLI.prototype.console = require('./cli/console');
CLI.prototype.version = require('./cli/version');
CLI.prototype.help = require('./cli/help');
CLI.prototype.help.download = require('./cli/help/download');
CLI.prototype.help.inspect = require('./cli/help/inspect');
CLI.prototype.download = require('./cli/download');
CLI.prototype.inspect = require('./cli/inspect');

/*
 * Expose the CLI object.
 */

module.exports = CLI;