var chai = require('chai');
var expect = chai.expect;
var snapshotLoader = require('./snapshotLoader');
var normalizeProject = require('../lib/normalizeProject');
var normalizeCommand = require('../lib/normalizeCommand');
var actionTypes = require('../lib/actionTypes');
var reduce = require('../lib');

// var FIXTURES = './test/fixtures/**/*.json';
var FIXTURES = './test/fixtures/StoryUpdate_710d16/*.json';

snapshotLoader.load(FIXTURES).forEach(function(snapshot) {
  it('reduces ' + snapshot.name + ' commands', function() {
    // console.log(snapshot['command.json'].stale_commands[0])
    var state = normalizeProject(snapshot['before.json']);
    var result = normalizeProject(snapshot['after.json']);
    var command = normalizeCommand(snapshot['command.json'].stale_commands[0]);
    var action = {type: actionTypes.RECEIVE_COMMAND, command: command};

    expect(reduce(state, action)).to.deep.equal(result);
  });
});
