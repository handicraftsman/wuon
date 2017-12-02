const CommandBranch = require('./CommandBranch');

module.exports = class {
  constructor() {
    this.branches = []
  }

  addBranch(definition, description, level) {
    var b = new CommandBranch(definition, description);
    this.branches.push(b);
    return b;
  }
}