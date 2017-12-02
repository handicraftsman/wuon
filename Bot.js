const winston = require('winston');

const IRCSocket = require('./IRCSocket');

module.exports = class {
  constructor(lvl) {
    this.lvl = lvl;
    this.plugins = {core: new (require('./core/index'))};
    this.servers = {};
    this.sockets = {};
    this.prefix = '!';
    this.nick = 'Wuon';
    this.user = 'Wuon';
    this.rnam = 'An IRC bot in JS';
    this.logger = require('./newLogger')(lvl || 'info', 'bot');
    this.logger.important('Hello, World!');
    this.helpServerHost = 'localhost';
    this.helpServerPort = process.env.PORT || 8080;
    this.permLevels = {
      0: 'User',
      1: 'Trusted',
      2: 'Operator',
      3: 'Admin',
      4: 'Owner'
    };
    this.db = new (require('sqlite3').Database)('./wuon.db');
    this.db.run(`
      CREATE TABLE IF NOT EXISTS perms (
        server TEXT,
        host   TEXT,
        level  NUMBER
      );
    `);
  }

  async run() {
    this.helpServer = require('./runHelpServer')(this, this.lvl);

    for (let name in this.servers) {
      this.servers[name].name = name;
      this.sockets[name] = new IRCSocket(this);
      this.sockets[name].name = name;
      if (this.servers[name].host == undefined) {
        throw new Error(`Cannot find hostname for the ${name} server!`);
      }
      this.sockets[name].host = this.servers[name].host;
      this.sockets[name].port = this.servers[name].port || 6667;
      this.sockets[name].nick = this.servers[name].nick || this.nick;
      this.sockets[name].user = this.servers[name].user || this.user;
      this.sockets[name].rnam = this.servers[name].rnam || this.rnam;
      this.sockets[name].pass = this.servers[name].pass || undefined;
      this.sockets[name].autojoin = this.servers[name].autojoin || [];
    }

    for (let i in this.sockets) {
      this.sockets[i].connect();
    }
  }

  getLevel(server, host, callback) {
    var cb = (err, row) => {
      if (err == null) {
        if (row != undefined) {
          callback(row.level);
        } else {
          callback(0);
        }
      }
    }
    var res = this.db.get('SELECT level FROM perms WHERE server=? AND host=?', [server, host], cb);
  }

  setLevel(server, host, level) {
    var db = this.db;
    var cb = (err, row) => {
      if (err == null) {
        if (row != undefined) {
          db.run('UPDATE perms SET level=? WHERE server=? AND host=?', [level,server,host]);
        } else {
          db.run('INSERT INTO perms (server, host, level) VALUES (?, ?, ?)', [server, host, level]);
        }
      }
    }
    var res = db.get('SELECT level FROM perms WHERE server=? AND host=?', [server, host], cb);
  }
}