#!/usr/bin/env node

var   util = require('util')
	, exec = require('child_process').exec
	, tilde = require('tilde-expansion')
	, match_types = ['phonegap', 'cordova', 'jquery', 'ember', 'sencha', 'backbone', 'jqtouch', 'kendo', 'bootstrap', 'modernizr', 'normalize', 'zepto']
	, matches = {}
	, apps = []
    , running = 0
    , limit = 10
    , root
    , checked = {}


exec('rm -rf ./temp', function() {
	exec('mkdir ./temp')
	tilde( '~/Music/iTunes/iTunes Media/Mobile Applications/', function(path){
		root = path

		if(root.charAt(0) == '~'){
			util.puts('Failed to find iTunes Mobile Applications directory. Exiting script...')
			process.exit()
		}

		exec('find "'+path+'" -name "*.ipa"', function(error, stdout, stderr) {
			apps = stdout.split('\n')

			util.puts('Launching Blade, searching *.ipa content. Limited to '+limit+' apps at once.')
			//Start searching
			while(running < limit)
	        	launcher()

		})
	})
	
})

//Launchs the next app for inspection if available
function launcher() {
	if(apps.length > 0 && running < limit) {
		var app = apps.shift()

        if(app !='') {

        	util.puts('Starting Process: ' + app.replace(root, ''))

        	running++
        	inspect(app)
        }
    }
    else if(apps.length == 0 && running == 0)
    	done()
}

//Unzips and examines the contents of the app for phonegap/javascript elements
function inspect(app) {
	var   app = app.replace(root, '')
		, folder = './temp/'+app.replace('./','')

	//util.puts('Inspecting ' + app)

    exec('unzip "'+root+app+'" -d "'+folder+'"', function(error, stdout, stderr) {

    	//util.puts(app+' unziped, searching for matches...')

    	checked[app] = 0

	    match_types.forEach(function(match_type, index) {

			exec('find "'+folder+'" | grep -i "'+match_type+'"', function(error, stdout, stderr) {
				if (stdout != '') {

					//util.puts("Matched "+app+" with "+match_type)

					if (matches[app] == null) {
						matches[app] = {}
						for (var i=0; i<match_types.length; i++) {
							matches[app][match_types[i]] = 0
						}
					}
					matches[app][match_type]++
				}
				checked[app]++

				util.puts("Checked "+checked[app]+"/"+match_types.length+" match_types for "+app)
				
				//If you've reached the last match_type then your done checking this app
				if(checked[app] == match_types.length) {
					running--
					util.puts('Done Checking '+app+', Running:'+running)
					// if(matches[app]==null)
					// 	util.puts('No Matches found for '+app)

					//If there are no more apps to launch and no processes running then we are done.
					if (apps.length == 0 && running == 0) {
	                	done()
	                }
	                else if(app.length != 0)
	                	launcher()
				}
                
			})
		})

	})
}

//Prints the results of the search
function done() {
	util.puts("\nResults:")
	console.log(matches)
}
