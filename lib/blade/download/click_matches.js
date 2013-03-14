#!/usr/bin/env node
var   fs              = require('fs')
    , path            = require('path')
    , shell           = require('shelljs')
    , execSync        = require('exec-sync')
    , PNGReader       = require('png.js')
    , path            = require('path')
    , exec            = require('child_process').exec
    , scripts         = path.join(__dirname, '..', '..', '..', 'res', 'ios')
    , template_path   = path.join (scripts, 'free_icon.png')
    , screenshot_path = path.join(scripts, 'screenshots', 'Screen0.png')
    , itunes_pass     = "********" //iTunes Password
    , first           = true
    , __png1 
    , __png2
    , raw_png1
    , dim_png1;

module.exports = function(dim, callback) {
    console.log("Finding free apps...");
    dim_png1 = dim;
    var raw_png2 = fs.readFileSync(template_path);
    reader = new PNGReader(raw_png2);
    reader.parse(function(err, png2){
        if (err) callback(err);
        __png2 = png2;
        module.exports.template_matches(callback);
    });
};

// finds best matches for __png2 inside the image __png1
module.exports.template_matches = function(callback) {

    cmd = 'osascript ' + path.join(scripts, 'screenshot.scpt') + ' ' + path.join(scripts, 'screenshots', 'Screen0.png');
    var out = execSync(cmd);//'screencapture ' + path.join(scripts, 'screenshots', 'Screen' + count + '.png') + ' >2 ./out');
    module.exports.handle(out, callback);
    var temp = fs.readFileSync(screenshot_path);
    if(raw_png1 == temp) {
        //page didn't change, done with search?
        callback(null);
        return;
    }
    else {
        raw_png1 = temp;
    }
        
    reader = new PNGReader(raw_png1);
    reader.parse(function(err, png1){
        if (err) callback(new Error(err));
        __png1 = png1;

        var w1 = __png1.getWidth(),  h1 = __png1.getHeight(),
            w2 = __png2.getWidth(),  h2 = __png2.getHeight();
        if(w2 >= w1 || h2 >= h1)
        {
            callback(new Error('Image2 is larger than Image1, unable to match.'));
            return;
        }
        // will keep track of best position found
        var lowestDiff = Infinity;
        var matches = [];
        var count = 0;
        // brute-force search through whole image (slow...)
        for(var x = dim_png1.x_tl; x < (dim_png1.x_br)-w2; x++){
            //on a row hits
            var variation = 0.0;
            for(var y = dim_png1.y_tl; y < (dim_png1.y_br)-h2; y++){
                //match template to this x,y . Possibly spawn process for increase efficiency
                variation = 0.0;
                for(var x2 = 0; x2 < w2; x2++){
                    for(var y2 = 0; y2 < h2; y2++){
                        var pixel1 = __png1.getPixel(x2 + x, y2 + y);
                        var pixel2 = __png2.getPixel(x2, y2);
                        var r1 = pixel1[0],  r2 = pixel2[0],
                            b1 = pixel1[1],  b2 = pixel2[1],
                            g1 = pixel1[2],  g2 = pixel2[2],
                            a1 = pixel1[3],  a2 = pixel2[3];
                        variation += a1*a2*Math.sqrt((r1-r2)*(r1-r2) + (g1-g2)*(g1-g2) + (b1-b2)*(b1-b2));
                    }
                }
                variation = variation/(__png2.getWidth()*__png2.getHeight())
                if(variation < 15000) {
                    lowestDiff = variation;
                    console.log("Match variation : " + variation);
                    var rand = Math.random() * (30000 - 5000) + 5000
                    matches.push({'x':x, 'y':y, 'delta':variation});
                    setTimeout(module.exports.download_item(x + 10, y + 10), rand);
                    count++;
                    //Speed up search process by skipping ahead when we know where we are
                    /*if(dim_png1.y_br - 100 < y)
                    {
                        y = dim_png1.y_tl;
                        x = x + w2;
                    }*/
                }
            }
        }

        //Wait for clicking to catch up?
        //var cmd = 'osascript ' + path.join(scripts, 'delay.scpt') + ' 30';
        //var out = execSync(cmd);
        var cmd = 'osascript ' + path.join(scripts, 'return.scpt');
        execSync(cmd);
        cmd = 'osascript ' + path.join(scripts, 'page_down.scpt');
        var out = execSync(cmd);
        //ALSO SCROLL UP A BIT TO AVOID MISSING THE ICONS STRATTALING THE BOTTOM.
        module.exports.handle(out, callback);
        cmd = 'osascript ' + path.join(scripts, 'delay.scpt') + ' 1';
        out = execSync(cmd);
        module.exports.handle(out, callback);
        module.exports.template_matches(callback);
    });

};

//compares __png2 to a relative position in __png1
module.exports.compareImages = function(rel_x, rel_y, callback) {
    var variation = 0.0;
    for(var x = 0; x < __png2.getWidth(); x++){
        for(var y = 0; y < __png2.getHeight(); y++){
            var pixel1 = __png1.getPixel(x + rel_x, y + rel_y);
            var pixel2 = __png2.getPixel(x, y);
            var r1 = pixel1[0],  r2 = pixel2[0],
                b1 = pixel1[1],  b2 = pixel2[1],
                g1 = pixel1[2],  g2 = pixel2[2],
                a1 = pixel1[3],  a2 = pixel2[3];
            variation += a1*a2*Math.sqrt((r1-r2)*(r1-r2) + (g1-g2)*(g1-g2) + (b1-b2)*(b1-b2));
        }
    }
    callback(variation/(__png2.getWidth()*__png2.getHeight()));
};

module.exports.download_item = function(x, y) {
    var cmd = path.join(scripts, 'click') + ' -x ' + x + ' -y ' + y;
    execSync(cmd);
    cmd = 'osascript ' + path.join(scripts, 'delay.scpt') + ' 0.5';
    execSync(cmd);
    if(first)
    {
        first = false;
        cmd = 'osascript ' + path.join(scripts, 'delay.scpt') + ' 6';
        execSync(cmd);
        cmd = 'osascript ' + path.join(scripts, 'type_enter.scpt') + ' "' + itunes_pass + '"';
        execSync(cmd);
        
    }
    //closee popup
    cmd = 'osascript ' + path.join(scripts, 'return.scpt');
    execSync(cmd);
};

module.exports.click = function(x, y) {
    var cmd = path.join(scripts, 'click') + ' -x ' + x + ' -y ' + y;
    execSync(cmd);
};

module.exports.handle = function(out, callback) {
    if (out != null && out.stdrr != '' || JSON.stringify(out) != '') {
        console.log("FAIL CODE:");
        console.log(out);
        callback(new Error('failed to execute ios command : ' + JSON.stringify(out)));
    }
};










