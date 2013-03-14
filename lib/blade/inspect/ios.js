#!/usr/bin/env node
/**
What does this module do?
    - Grabs any previously loged data from the log file at blad's root dir
    - Finds all apps in the iTunes Mobile Applications
    - unzips and inspects files contained in .ipa
    - logs total results back in file.
**/
var   util        = require('util')
    , fs          = require('fs')
    , path        = require('path')
    , exec        = require('child_process').exec
    , tilde       = require('tilde-expansion')
    . analyze     = require('../analyze/results')
    , log_path    = path.join(__dirname, '..', '..', '..', 'log')
    , match_types = ['phonegap', 'cordova', 'jquery', 'ember', 'sencha', 'backbone', 'jqtouch', 'kendo', 'bootstrap', 'modernizr', 'normalize', 'zepto']
    , matches     = {}
    , apps        = []
    , running     = 0   // number of apps that are currently being inspected, should never go above batch_size
    , apps_checked= 0   // number of apps that have been looked at
    , skipped     = 0   // number of apps skipped (since they were already logged)
    , batch_size  = 10  // the maximum number of apps to be inspected at one time.  
    , done        = false
    , itunes_apps_path
    , max_apps    = Infinity //maximum apps in the apps folder that we should inspect
    , num_apps;

module.exports = function(callback) {

    exec('rm -rf ./temp', function() {
        util.puts('Creating temp directory...')
        exec('mkdir ./temp');
        var temp = __dirname.split(path.sep);
        itunes_apps_path = path.join(path.sep + temp[1], temp[2], 'Music', 'iTunes', 'iTunes Media', 'Mobile Applications' + path.sep);

        if(fs.existsSync(log_path))
        {
            util.puts('Loading previous searches...');
            var data = fs.readFileSync(log_path, 'utf8');
            if(data) {
                matches = JSON.parse(data);
                console.log("loaded " + Object.keys(matches).length + " previously inspected apps.");
            }
            else {
                callback(new Error('Failed to load previous log data.'));
                return;
            }
        }
        else
        {
            util.puts("Could not find previous log file, starting from scratch....");
        }

        exec('find "' + itunes_apps_path + '" -name "*.ipa"', function(error, stdout, stderr) {
            apps = stdout.split('\n');
            if(max_apps < apps.length)
                num_apps = max_apps;
            else
                num_apps = apps.length;
            util.puts('Launching Blade, searching *.ipa content. Limited to ' + batch_size + ' apps at once.');
            //Start searching
            while(apps.length > 0 && running < batch_size && apps_checked < num_apps && !done) {
                module.exports.launcher(callback);
            }

        });
        

    });
};

//Launchs the next app for inspection if available
module.exports.launcher = function launcher(callback) {
    if(apps.length > 0 && running < batch_size && num_apps != skipped && !done) {
        var app = apps.shift().split(path.sep);
        app = app[app.length-1];
        //return;
        apps_checked++;
        if(app !='' && matches[app] == null) {

            //util.puts('Starting Process: ' + app);
            running++;
            module.exports.inspect(app, callback);
        }
        else if(matches[app] != null) //If app already exited in log file.
        {
            util.puts('Skipped app #' + (apps_checked - running) + ' of ' + num_apps + ' apps : ' + app.replace(itunes_apps_path, ''));
            skipped++;
            //console.log('Launched: ' + launched + " Num Apps : " + num_apps + " Apps Checked : " + apps_checked);
            if(!done && apps_checked < num_apps)
                module.exports.launcher(callback);
        }
    }
    else if((apps.length == 0 && running == 0 || num_apps == 0) && !done) {
        done = true;
        module.exports.done(callback);
    }

    //Handle case when all apps have been logged
    //console.log('Skipped: ' + skipped + " Num Apps : " + num_apps);
    if(num_apps == skipped && !done)
    {
        done = true;
        util.puts("No new apps to unpack, getting results..." + num_apps + " " + skipped);
        module.exports.done(callback);
    }
};

//Unzips and examines the contents of the app for matches
module.exports.inspect = function inspect(app, callback) {
    var folder = './temp/'+app;
    //util.puts('Inspecting ' + app + ' Running: ' + running);
    // unzips the app and pipes stdout to /dev/null to avoid a maxBuffer exceeded exeption when unpacking large apps
    exec('unzip "' + itunes_apps_path + app + '" -d "' + folder + '" > /dev/null', function(error, stdout, stderr) {
        if(error != null || stderr != '') {
            util.puts('Error unzipping ' + app);
            util.puts(error +"  "+ stderr);
            running--;
            module.exports.launcher(callback);
        }
        else
        {
            //util.puts(app+' unziped, searching for matches...')
            if (matches[app] == null) {
                matches[app] = {};
                matches[app]['Total Hits'] = 0;
                matches[app]['Catagories'] = [];
                matches[app]['Matches'] = {};
            }
            var matches_checked = 0; //number of matches that we've checked for this app
            match_types.forEach(function(match_type, index) {
                exec('find "' + folder + '" | grep -i "' + match_type + '"', function(error, stdout, stderr) {
                    if (stdout != '') {
                        var grep_result = stdout.split('\n');
                        matches[app]['Matches'][match_type] = grep_result.length - 1;
                        matches[app]['Total Hits'] += grep_result.length - 1;
                    }
                    matches_checked++;

                    //If you've reached the last match_type then your done checking this app
                    if(matches_checked >= match_types.length) {
                        running--;
                        util.puts('Checked '+(apps_checked - running) + ' of ' + num_apps + ' apps : ' + app);
                        //remove temp unzipped app
                        exec('rm -rf "' + folder + '"', function(error, stdout, stderr) {
                            //output error
                            if(stderr!='' || error !=null)
                            {
                                util.puts(stderr);
                            }
                        });
                        //If there are no more apps to launch and no processes running then we are done.
                        if ((apps.length == 0 && running == 0) || (apps_checked >= num_apps && running == 0)) {
                            module.exports.done(callback);
                        }
                        else if(apps.length != 0 && apps_checked < num_apps)
                        {
                            module.exports.launcher(callback);
                        }
                        else
                        {
                            // you should get here if you hit max apps or finished all apps and there are still apps being inspected
                            // therefore, do nothing till those apps finish, (running should be 0)
                        }
                    }
                });
            });
        }
    });
};

//Prints the results of the search
module.exports.done = function done(callback) {
    console.log("DONE");
    //util.puts("\nResults:")
    //console.log(matches)
    if(matches != null && matches != {} && Object.keys(matches).length > 0) {
        fs.writeFile(log_path, JSON.stringify(matches), function(error) {
            if (error) {
                callback(new Error(error));
                return;
            }
            else {
                module.exports.results = require('./../analyze/results');
                module.exports.results(matches, callback);
                //callback(null);
            }
        })
    }
    else {
        callback(new Error("No results, check code + path to apps"));
        return;
    }   
};
