const util = require('util');
const net = require('net');
const readline = require('readline');
const events = require('events');

module.exports = class extends events.EventEmitter {
  constructor(bot) {
    super();
    this.sock = undefined;
    this.host = undefined;
    this.port = 6667;
    this.nick = 'Wuon';
    this.user = 'Wuon';
    this.rnam = 'An IRC bot in JS';
    this.pass = undefined;
    this.autojoin = [];
    this.bot = bot;
    this.userCache = new (require('./UserCache'))(this);
    this.sock = new net.Socket();
    this.sock.setEncoding('utf-8');
  }

  [util.inspect.custom](a,b) { return `<IRCSocket ${this.host}:${this.port}>`; }

  connect() {
    this.log = require('./newLogger')(this.bot.lvl || 'info', '!' + this.name);
    this.sock.connect(this.port, this.host, () => {
      this.log.important(`Hello, IRC! (${this.host}:${this.port})`);
    });

    this.rl = readline.createInterface({ input: this.sock });

    this.rl.on('line', (l) => {
      this.handleRawMessage(l);
    });

    this.sock.on('close', () => {
      this.rl.close();
    });

    this.authenticate();

    this.queue = [];
    this.writer(this);
  }

  authenticate() {
    if (this.pass != undefined) {
      this.write(`PASS ${this.pass}`);
    }

    this.write(`NICK ${this.nick}`);
    this.write(`USER ${this.user} 0 * :${this.rnam}`);
  }

  write(data) {
    this.sock.write(data + '\r\n');
    this.log.irc(`[W] ${data}`.trim());
  }

  writeq(data) {
    this.queue.push(data);
  }

  writer(bot) {
    var msg = bot.queue.shift();
    if (msg) {
      bot.write(msg);
      setTimeout(bot.writer, 700, bot);
    } else {
      setTimeout(bot.writer, 10, bot);
    }
  }

  handleRawMessage(data) {
    data = data;
    this.log.irc(`[R] ${data}`);
  
    const rPing = /^PING :(.+)$/;
    const rCode = /^:.+? (\d\d\d) .+? (.+)$/
    const rPrivmsg = /^:(.+?)!(.+?)@(.+?) PRIVMSG (.+?) :(.+)$/;
    const rJoin = /^:(.+?)!(.+?)@(.+?) JOIN (.+)$/;
    const rNick = /^:(.+?)!(.+?)@(.+?) NICK :(.+)$/;

    if (rPing.test(data)) {
      this.handlePing(rPing.exec(data)[1]);
    }

    if (rCode.test(data)) {
      var m = rCode.exec(data);
      this.handleCode(m[1], m[2]);
    }

    if (rPrivmsg.test(data)) {
      var m = rPrivmsg.exec(data);
      this.handlePrivmsg(m[1], m[2], m[3], m[4], m[5]);
    }

    if (rJoin.test(data)) {
      var m = rJoin.exec(data);
      this.handleJoin(m[1], m[2], m[3], m[4]);
    }

    if (rNick.test(data)) {
      var m = rNick.exec(data);
      this.handleNick(m[1], m[2], m[3], m[4]);
    }

  }

  handlePing(target) {
    for (var pid in this.bot.plugins) {
      var plugin = this.bot.plugins[pid];
      if (plugin.handlePing != undefined) {
        plugin.handlePing(this, target);
      }
    }
  }

  handleCode(code, extra) {
    if (code == '352') {
      var r = /^.+? (.+?) (.+?) .+? (.+?) .+$/;
      if (r.test(extra)) {
        var m = r.exec(extra);
        this.userCache.setUser(m[3], m[1]);
        this.userCache.setHost(m[3], m[2]);
      }
    }

    for (var pid in this.bot.plugins) {
      var plugin = this.bot.plugins[pid];
      if (plugin.handleCode != undefined) {
        plugin.handleCode(this, code, extra);
      }
    }
  }

  handlePrivmsg(nick, user, host, target, message) {
    for (var pid in this.bot.plugins) {
      var plugin = this.bot.plugins[pid];
      if (plugin.handlePrivmsg != undefined) {
        plugin.handlePrivmsg(this, nick, user, host, target, message);
      }
    }

    if (message.slice(0,this.bot.prefix.length) == this.bot.prefix) {
      var split = message.slice(this.bot.prefix.length).split(' ');
      var cmd = split[0];
      var dat = split.slice(1).join(' ');
      for (var pid in this.bot.plugins) {
        var plugin = this.bot.plugins[pid];
        for (var cid in plugin.commands) {
          var command = plugin.commands[cid];
          if (cid.toLowerCase() != cmd.toLowerCase()) { continue; }
          for (var branch of command.branches) {
            var m = require('./matchCommand')(branch, require('./parseCommand')(dat));
            if (m != null && branch.handler != undefined) {
              this.handleCommand({
                [util.inspect.custom](a,b) { return '<CommandMessageInfo>'; },
                bot: this.bot,
                sock: this,
                command: command,
                branch: branch,
                cmd: cmd,
                dat: dat,
                val: m,
                nick: nick,
                user: user,
                host: host,
                target: target,
                message: message,
                reply: (msg) => { 
                  if (target == this.nick) {
                    this.privmsg(nick, msg);
                  } else {
                    this.privmsg(target, msg);
                  }
                },
                nreply: (msg) => {
                  this.notice(nick, msg);
                }
              });
            }
          }
        }
      }
    }
  }

  handleCommand(dat) {
    this.bot.getLevel(dat.sock.name, dat.host, (level) => {
      if (level >= dat.branch.level) {
        dat.branch.handler(dat);
      }
    });
  }

  handleJoin(nick, user, host, channel) {
    if (nick == this.nick) {
      this.writeq(`WHO ${channel}`);
    }
    this.userCache.setUser(nick, user);
    this.userCache.setHost(nick, user);
  }

  handleNick(nick, user, host, newNick) {
    if (nick == this.nick) { this.nick = newNick; }
    this.userCache.rename(nick, newNick)
    this.userCache.setUser(newNick, user);
    this.userCache.setHost(newNick, user);
  }

  privmsg(target, message) {
    for (var l of message.replace(/[\r\n\t ]+/g, ' ').match(/.{0,400}/g)) {
      if (l.trim() != '') {
        this.writeq(`PRIVMSG ${target} :${l}`);
      }
    }
  }

  notice(target, message) {
    for (var l of message.replace(/[\r\n\t ]+/g, ' ').match(/.{0,400}/g)) {
      if (l.trim() != '') {
        this.writeq(`NOTICE ${target} :${l}`);
      }
    }
  }

  join(target) {
    this.writeq(`JOIN ${target}`);
  }

  part(target, reason) {
    if (reason == undefined) {
      reason = 'Bye!';
    }
    this.writeq(`PART ${target} :${reason}`);
  }

  setNick(newNick) {
    this.writeq(`NICK ${newNick}`);
  }

  userMode(chan, mode, nick) {
    this.writeq(`MODE ${chan} ${mode} ${nick}`);
  }

  chanMode(chan, mode) {
    this.writeq(`MODE ${chan} ${mode}`);
  }

  kick(chan, nick, reason) {
    reason = reason || 'Bye';
    this.writeq(`KICK ${chan} ${nick} :${reason}`);
  }

  remove(chan, nick, reason) {
    reason = reason || 'Bye';
    this.writeq(`REMOVE ${chan} ${nick} :${reason}`);
  }
}