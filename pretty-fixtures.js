#!/usr/bin/env node

var glob = require('glob');
var fs   = require('fs');

var fixtures = glob.sync(__dirname + '/test/fixtures/**/*.json');

fixtures.forEach(function(fixture) {
  fs.readFile(fixture, function (err, data) {
    if (err) throw err;
    console.log(fixture);
    fs.writeFile(fixture, JSON.stringify(JSON.parse(data), null, '  '))
  });
});

// console.log('fixtures', fixtures)
