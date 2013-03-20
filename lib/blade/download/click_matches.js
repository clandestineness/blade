#!/usr/bin/env node
var   path            = require('path')
    , fs              = require('fs')
    , PNGReader       = require('png.js')
    , path            = require('path')
    , applescripts    = require('./applescripts')
    , scripts         = path.join(__dirname, '..', '..', '..', 'res', 'ios')
    , free_template   = path.join(scripts, 'free_icon.png')
    , end_template    = path.join(scripts, 'end_icon.png')
    , screenshot_path = path.join(scripts, 'screenshots', 'Screen0.png')
    , itunes_pass     = "********" //iTunes Password
    , first           = true
    , limit
    , num_downloaded
    , __png1 
    , __png_template
    , __png_end
    , dim;


module.exports = function(dim_png1, download_limit, callback) {
    var methods = {};
    limit = download_limit;
    num_downloaded = 0;
    // finds best matches for __png_template inside the image __png1
    methods.click_template_matches = function (callback) {

        applescripts.screenshot(screenshot_path)
        applescripts.delay(0.75);

        var raw_png1 = fs.readFileSync(screenshot_path);
        reader = new PNGReader(raw_png1);
        reader.parse(function(err, png1){
            if(err != null || err != '') callback(new Error(err));
            var variation = 0.0;
            __png1 = png1;
            if(methods.check_bottom(__png1))
            {
                console.log("At bottom");
                return;
            }
            var w1 = __png1.getWidth(),  h1 = __png1.getHeight(),
                w2 = __png_template.getWidth(),  h2 = __png_template.getHeight();
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
            for(var x = dim.x_tl; x < (dim.x_br)-w2; x++){
                //on a row hits
                var variation = 0.0;
                for(var y = dim.y_tl; y < (dim.y_br)-h2; y++){
                    //match template to this x,y . Possibly spawn process for increase efficiency
                    variation = 0.0;
                    for(var x2 = 0; x2 < w2; x2++){
                        for(var y2 = 0; y2 < h2; y2++){
                            var pixel1 = __png1.getPixel(x2 + x, y2 + y);
                            var pixel2 = __png_template.getPixel(x2, y2);
                            var r1 = pixel1[0],  r2 = pixel2[0],
                                b1 = pixel1[1],  b2 = pixel2[1],
                                g1 = pixel1[2],  g2 = pixel2[2],
                                a1 = pixel1[3],  a2 = pixel2[3];
                            variation += a1*a2*Math.sqrt((r1-r2)*(r1-r2) + (g1-g2)*(g1-g2) + (b1-b2)*(b1-b2));
                        }
                    }
                    variation = variation/(__png_template.getWidth()*__png_template.getHeight())
                    if(variation < 15000) {
                        if(num_downloaded >= limit)
                        {
                            console.log("Limit reached!");
                            callback(null);
                            return;
                        }
                        lowestDiff = variation;
                        console.log("Match variation : " + variation);
                        var rand = Math.random() * (30000 - 5000) + 5000
                        matches.push({'x':x, 'y':y, 'delta':variation});
                        setTimeout(methods.download_item(x + 10, y + 10), rand);
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
            applescripts.enter();

            //Check if we're at the bottom
            if(methods.check_bottom(__png1))
            {
                console.log("SEARCH FINISHED")
                callback(null);
            }
            else
            {
                applescripts.page_down();
                //ALSO SCROLL UP A BIT TO AVOID MISSING THE ICONS STRATTALING THE BOTTOM?
                // NO! Page down doesn't go all the way to a new page so this doesn't need to happen.
                /*applescripts.delay(1);
                applescripts.key_up();
                applescripts.delay(1);*/

                methods.click_template_matches(callback);
            }
        });

    };

    //compares __png_end to the bottom of png
    methods.check_bottom = function(png) {
        if(png == null || __png_end == null) {
            return false;
        }
        var start = dim.y_br - (5 * (__png_end.getHeight()));
        var lowestDiff = Infinity;
        for(var x = dim.x_br; x > dim.x_tl ; x--){
            //console.log("Searching : " + x);
            for(var y = start; y < dim.y_br; y++) {
                var variation = 0.0;
                for(var x_box = 0; x_box < __png_end.getWidth(); x_box++) {
                    for(var y_box = 0; y_box < __png_end.getHeight(); y_box++) {
                        if((x + x_box) < png.getWidth() && (y + y_box) < png.getHeight())
                        {
                            var pixel1 = png.getPixel(x + x_box, y + y_box);
                            var pixel2 = __png_end.getPixel(x_box, y_box);
                            var r1 = pixel1[0],  r2 = pixel2[0],
                                b1 = pixel1[1],  b2 = pixel2[1],
                                g1 = pixel1[2],  g2 = pixel2[2];
                                a1 = pixel1[3],  a2 = pixel2[3];
                            variation += a1*a2*Math.sqrt((r1-r2)*(r1-r2) + (g1-g2)*(g1-g2) + (b1-b2)*(b1-b2));
                        }
                    }
                }
                var result = variation/(__png_end.getWidth()*__png_end.getHeight());
                if(lowestDiff > result)
                {
                    lowestDiff = result;
                    console.log("RESULT:" + result);
                }
                if(result < 20000)
                {
                    return true;
                }
            }
        }
        return false;
    };

    methods.download_item = function(x, y) {
        applescripts.click(x,y);
        num_downloaded++;
        applescripts.delay(0.5);
        if(first)
        {
            first = false;
            applescripts.delay(6);
            applescripts.type_enter(itunes_pass);
        }
        //close any popups
        applescripts.enter();
    };

    console.log("Finding free apps...");
    dim = dim_png1;
    var raw_png  = fs.readFileSync(free_template);
    reader = new PNGReader(raw_png);
    reader.parse(function(err, png){
        if(err != null || err != '') callback(new Error(err));
        __png_template = png;
        var raw_png2 = fs.readFileSync(end_template);
        reader2 = new PNGReader(raw_png2)
        reader2.parse(function(err, png2) {
            if(err != null || err != '') callback(new Error(err));
            __png_end = png2;
            console.log("Height : " + __png_end.getHeight());
            console.log("Width : " + __png_end.getWidth());
            methods.click_template_matches(callback);
        })
    });
}










