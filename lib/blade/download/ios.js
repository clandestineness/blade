var   util        = require('util')
    , fs          = require('fs')
    , path        = require('path')
    , execSync    = require('exec-sync')
    , PNGReader   = require('png.js')
    , applescripts= require('./applescripts')
    , scripts     = path.join(__dirname, '..', '..', '..', 'res', 'ios')
    , iTunes_path = '/Applications/iTunes'
    , screenshots = ''
    , query;

/*
Things to search for on apps store (high yield of results)
- free
- utilities
- productivity
- news
- business
- reference
*/

//Dimentions to open up iTunes with
var dim = { x_tl : 50,   //Top right x
            y_tl : 50,   //Top right y
            x_br : 1250, //Bottom left x
            y_br : 750}; //Bottom left y

module.exports = function(search_term, callback) {
    query = search_term;
    console.log("Initializing iTunes...");
    applescripts.GUIScripting_status();
    applescripts.set_iTunes_window(dim.x_tl, dim.y_tl, dim.x_br, dim.y_br);
    applescripts.go_to_store();
    module.exports.download_free_iphone_apps(callback);
};

module.exports.download_free_iphone_apps = function(callback) {
    //double click?
    applescripts.click((dim.x_br - 100), (dim.y_tl + 32), callback);

    //enter search (in this case "free")
    applescripts.backspace(20);
    applescripts.type_enter(query);
    applescripts.delay(10);
    //then select "See All"
    applescripts.click((dim.x_br - 300), (dim.y_tl + 190), callback);
    //start clicks on matches with the "free_icon"
    var start_downloading = require('./click_matches');
    start_downloading(dim, Infinity, function(response) {
        console.log(response);
        return;
    });
}
