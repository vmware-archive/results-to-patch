var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');

var helper = {
  loadFixture: function(searchString) {
      var globString = path.resolve(__dirname, '../json/' + searchString + '*.json'),
          file = _.first(glob.sync(globString)),
          text = fs.readFileSync(file, 'utf8');
      return JSON.parse(text);
  }
};

module.exports = helper;