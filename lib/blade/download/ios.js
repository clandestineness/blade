var   util        = require('util')
    , fs          = require('fs')
    , path        = require('path')
    , execSync    = require('exec-sync')
    , PNGReader   = require('png.js')
    , scripts     = path.join(__dirname, '..', '..', '..', 'res', 'ios')
    , iTunes_path = '/Applications/iTunes'
    , screenshots = ''
    , query;

//Dimentions to open up iTunes with
var dim = { x_tl : 50,   //Top right x
            y_tl : 50,   //Top right y
            x_br : 1250, //Bottom left x
            y_br : 750}; //Bottom left y

module.exports = function(search_term, callback) {
    query = search_term;
    console.log("Initializing iTunes...");
    var cmd = 'osascript ' + path.join(scripts, 'GUIScripting_status.scpt');
    var out =  execSync(cmd);
    module.exports.handle(out, callback);

    cmd = 'osascript ' + path.join(scripts, 'iTunesWindow.scpt') + ' ' + dim.x_tl + ' ' + dim.y_tl + ' ' + dim.x_br + ' ' + dim.y_br;
    out = execSync(cmd);
    module.exports.handle(out, callback);

    cmd = 'osascript ' + path.join(scripts, 'go_to_store.scpt');
    out = execSync(cmd);
    module.exports.handle(out, callback);

    module.exports.download_free_iphone_apps(callback);
};

module.exports.open_itunes = function(callback) {
    var cmd = 'osascript ' + path.join(scripts, 'iTunesWindow.scpt') + ' ' + dim.x_tl + ' ' + dim.y_tl + ' ' + dim.x_br + ' ' + dim.y_br;
    var out =  execSync(cmd);
    module.exports.handle(out, callback);
};

module.exports.open_store = function(callback) {
    var cmd = 'osascript ' + path.join(scripts, 'go_to_store.scpt');
    var out =  execSync(cmd);
    module.exports.handle(out, callback);
};

module.exports.download_free_iphone_apps = function(callback) {
    //double click?
    module.exports.click((dim.x_br - 150), (dim.y_tl + 32), callback);
    module.exports.click((dim.x_br - 150), (dim.y_tl + 32), callback);

    //enter search (in this case "free")
    for(i=0; i<10; i++) {
        cmd = 'osascript ' + path.join(scripts, 'delete.scpt');
        out =  execSync(cmd);
    }
    var cmd = 'osascript ' + path.join(scripts, 'type_enter.scpt') + ' "' + query + '"';
    var out =  execSync(cmd);
    module.exports.handle(out, callback);
    cmd = 'osascript ' + path.join(scripts, 'delay.scpt') + ' 10';
    out =  execSync(cmd);
    //then select "See All"
    module.exports.click((dim.x_br - 300), (dim.y_tl + 190), callback);
    var count = 0;
    
    //start clicks on matches with the "free_icon"
    module.exports.click_matches = require('./click_matches');
    module.exports.click_matches(dim, function(response) {
        console.log(response);
        return;
    });
}


module.exports.click = function(x, y, callback) {
    var cmd = path.join(scripts, 'click') + ' -x ' + x + ' -y ' + y;
    var out =  execSync(cmd);
    module.exports.handle(out, callback);
}

module.exports.handle = function(out, callback) {
    if (out!= '' || out.stderr != null || out.stderr != '') {
        callback(new Error('failed to execute ios command : ' + JSON.stringify(out)));
    }
};
