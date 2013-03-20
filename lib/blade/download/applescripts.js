var   path            = require('path')
    , shell           = require('shelljs')
    , execSync        = require('exec-sync')
    , scripts         = path.join(__dirname, '..', '..', '..', 'res', 'ios');

module.exports = {
    delay : function(time) {
        var cmd = 'osascript ' + path.join(scripts, 'delay.scpt') + ' ' + time;
        execSync(cmd); 
    },
    screenshot : function(screenshot_path) {
        var cmd = 'osascript ' + path.join(scripts, 'screenshot.scpt') + ' ' + screenshot_path;
        execSync(cmd);
    },
    enter : function() {
        var cmd = 'osascript ' + path.join(scripts, 'return.scpt');
        execSync(cmd);
    },
    backspace : function(num) {
        var cmd = 'osascript ' + path.join(scripts, 'delete.scpt');
        for(var i = 0; i < num; i++) {
            execSync(cmd);
        }
    },
    key_up : function() {
        var cmd = 'osascript ' + path.join(scripts, 'up_key.scpt');
        execSync(cmd);
    },
    page_down : function() {
        var cmd = 'osascript ' + path.join(scripts, 'page_down.scpt');
        execSync(cmd);
    },
    page_up : function() {
        var cmd = 'osascript ' + path.join(scripts, 'page_up.scpt');
        execSync(cmd);
    },
    click : function(x, y) {
        var cmd = path.join(scripts, 'click') + ' -x ' + x + ' -y ' + y;
        execSync(cmd);
    },
    type_enter : function(text) {
        var cmd = 'osascript ' + path.join(scripts, 'type_enter.scpt') + ' "' + text + '"';
        execSync(cmd);
    },
    GUIScripting_status : function() {
        var cmd = 'osascript ' + path.join(scripts, 'GUIScripting_status.scpt');
        execSync(cmd);
    },
    set_iTunes_window : function(x_tl, y_tl, x_br, y_br) {
        var cmd = 'osascript ' + path.join(scripts, 'iTunesWindow.scpt') + ' ' + x_tl + ' ' + y_tl + ' ' + x_br + ' ' + y_br;
        execSync(cmd);
    },
    go_to_store : function() {
        var cmd = 'osascript ' + path.join(scripts, 'go_to_store.scpt');
        execSync(cmd);
    }
}