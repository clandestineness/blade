/* This script is passed in a JSON string contianing the app 
data/matches from blade and outputs any usefull data that we 
want to pull out of the JSON results*/

var   util        = require('util')
    , fs          = require('fs')
    , exec        = require('child_process').exec;

/*if(fs.existsSync('./log'))
{
    matches = JSON.parse(fs.readFileSync('./log', 'utf8'));
    data(matches)
}
else
{
    util.puts('No log file found, run `blade` to generate log file.')
}*/


module.exports = function results (json_data, callback) {
    //module.exports.results_grouped_by_match(json_data, callback);
    if(json_data == null || json_data.length < 1)
    {
        callback(new Error("No data json data recieved from caller"));
        return;
    }
    //module.exports.raw_results(json_data, callback);
    module.exports.results_grouped_by_match(json_data, callback);
    module.exports.phone_gap_cordova_stats(json_data);
};

module.exports.phone_gap_cordova_stats = function(json_data) {
    var num_cpg = 0;
    for(var item in json_data) {
        if(Object.keys(json_data[item]['Matches']).length > 0)
        {
            for(var match in json_data[item]['Matches'])
            {
                if(match == 'cordova' || match == 'phonegap')
                {
                    num_cpg++;
                }
            }
        }
    }

    var output = [
        '',
        '  ' + num_cpg + ' out of ' + Object.keys(json_data).length + ' apps used phonegap or cordova.',
        '  That\'s %' + ((num_cpg / Object.keys(json_data).length) * 100) + '!',
        '  '
    ];

    console.log(output.join('\n'));



}

module.exports.results_grouped_by_match = function(json_data, callback) {
    var total_matches = 0;
    var results = {};
    for(var item in json_data) {
        if(Object.keys(json_data[item]['Matches']).length > 0)
        {
            total_matches++;
            for(var match in json_data[item]['Matches'])
            {
                if(results[match] == null)
                {
                    results[match] = [];
                }
                results[match].push(item);
            }
        }
    }

    var output = [
        '',
        '  ' + total_matches + ' out of ' + Object.keys(json_data).length + ' apps had matches.',
        '',
        '  Results :',
        ''
    ];

    console.log(output.join('\n'));
    console.log(results);
    callback(null);
};

module.exports.raw_results = function(json_data, callback) {

    var output = [
        '',
        '  Raw json data for all downloaded apps.',
        '',
        '  Results :',
        ''
    ];

    console.log(output.join('\n'));
    console.log(json_data);
    callback(null);
};
