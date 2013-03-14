/**
 * Blade object.
 */

function Blade() {
}

/*
 * Blade prototype chain composed of isolated actions.
 */

Blade.prototype.download = require('./blade/download');
Blade.prototype.inspect = require('./blade/inspect');

/*
 * Expose the Blade object.
 */

module.exports = Blade;