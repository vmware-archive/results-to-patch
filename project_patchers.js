module.exports = {
  version: function(project, command) {
    return [{op: 'replace', path: '/version', value: command.project.version}];
  }
};