#!/usr/bin/env node

'use strict';
var fs = require('fs');
var path = require('path');
var randomName = require('./');
var Promise = require('bluebird');
var updateP = Promise.promisify(updatePackage);
var yargs = require('yargs')
    .boolean('p')
    .alias('p', 'package')
    .describe('p', 'add to package.json')
    .boolean('h')
    .alias('h', 'help')
    .usage('Return a valid and free package name.\nUsage: $0 [name]')
    .example('$0', 'get random name')
    .example('$0 name', 'get random name based on supplied name')
    .example('$0 -p', 'get random name and add to package.json')
    .example('$0 --help', 'this help');
var argv = yargs.argv
if (argv.h) {
	yargs.showHelp();
	process.exit();
}
randomName(argv._[0]).then(function (name) {
	if (argv.p) {
		return updateP(name).then(function () {
			return name;
		});
	}
	return name;
}).then(function (name) {
	console.log(name);
	process.exit();
}).catch(function (e) {
	process.nextTick(function () {
		throw e;
	});
});
function updatePackage(name, cb) {
	var cwd = process.cwd();
	fs.readFile(path.join(cwd, 'package.json'), {encoding:'utf8'}, function (err, data) {
		if (err) {
			return cb(new Error("no package.json"));
		}
		var json;
		try {
			json = JSON.parse(data);
		} catch(e) {
			return cb(e);
		}
		json.name = name;
		fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(json, false, 4), cb);
	});
}