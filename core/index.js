const Command = require('../Command');
const url = require('url');

module.exports = class extends (require('../Plugin')) {
  constructor() {
    super();
    this.name = 'Core';
    this.version = require('../version');
    this.description = 'The core plugin';
    
    this.commands.help = new Command();
    this.commands.help.addBranch(
      '',
      'Shows a general help message'
    ).setHandler((info) => {
      info.nreply(`Open http://${info.bot.helpServerHost}:${info.bot.helpServerPort}/ to get info about all available commands`);
    });
    this.commands.help.addBranch(
      'what',
      'Shows a help message about a plugin or a command'
    ).setHandler((info) => {
      for (var pid in info.bot.plugins) {
        var plugin = info.bot.plugins[pid];
        if (pid == info.val.positionals.what) {
          var p = new url.URLSearchParams();
          p.set('plugin', pid);
          info.nreply(`You can find help for the '${pid}' plugin here: http://${info.bot.helpServerHost}:${info.bot.helpServerPort}/plugin?${p.toString()}`);
        }
        for (var cid in plugin.commands) {
          if (cid == info.val.positionals.what) {
            var p = new url.URLSearchParams();
            var u = new url.URL(`http://${info.bot.helpServerHost}:${info.bot.helpServerPort}/plugin?${p.toString()}`);
            u.searchParams.set('plugin', pid);
            u.hash = 'cmd-' + cid;
            info.nreply(`You can find help for the '${cid}' command here: ${u.href}`);
          }
        }
      }
    });

    this.commands.join = new Command();
    this.commands.join.addBranch(
      'channel',
      'Joins the given channel'
    ).setLevel(3).setHandler((info) => {
      info.sock.join(info.val.positionals.channel);
    });

    this.commands.part = new Command();
    this.commands.part.addBranch(
      '=reason',
      'Parts the current channel'
    ).setLevel(3).setHandler((info) => {
      var reason = info.val.options.reason || 'Bye!';
      info.sock.part(info.target, reason);
    });
    this.commands.part.addBranch(
      'channel =reason',
      'Parts the given channel'
    ).setLevel(3).setHandler((info) => {
      var reason = info.val.options.reason || 'Bye!';
      info.sock.part(info.val.positionals.channel, reason);
    });

    this.commands.nick = new Command();
    this.commands.nick.addBranch(
      '',
      'Gets current nickname'
    ).setHandler((info) => {
      info.reply(`My nickname is ${info.sock.nick}`);
    });
    this.commands.nick.addBranch(
      'newNick',
      'Changes nickname'
    ).setLevel(3).setHandler((info) => {
      info.sock.setNick(info.val.positionals.newNick);
    });

    this.commands.getLevel = new Command();
    this.commands.getLevel.addBranch(
      '',
      'Gets invoker\'s permission level' 
    ).setHandler((info) => {
      info.bot.getLevel(info.sock.name, info.host, (level) => {
        info.reply(`Your permission level is ${info.bot.permLevels[level]} (${level})`);
      });
    });
    this.commands.getLevel.addBranch(
      'who -host',
      'Gets target\'s permission level'
    ).setHandler((info) => {
      var who;
      if (!info.val.flags.host) {
        who = info.sock.userCache.getHost(info.val.positionals.who);
      } else {
        who = info.val.positionals.who;
      }
      info.bot.getLevel(info.sock.name, who, (level) => {
        info.reply(`${info.val.positionals.who}'s permission level is ${info.bot.permLevels[level]} (${level})`)
      });
    });

    this.commands.setLevel = new Command();
    this.commands.setLevel.addBranch(
      'who level -host',
      'Sets target\'s permission level'
    ).setLevel(4).setHandler((info) => {
      var who;
      if (!info.val.flags.host) {
        who = info.sock.userCache.getHost(info.val.positionals.who);
      } else {
        who = info.val.positionals.who;
      }
      var level = parseInt(info.val.positionals.level);
      if (level == NaN || level < 0 || level > 4) {
        info.reply('Error: level is out of range!');
        return;
      }
      info.bot.setLevel(info.sock.name, who, level);
      info.reply('Done!');
    });

    this.commands.raw = new Command();
    this.commands.raw.addBranch(
      '...',
      'Sends the given string to the server'
    ).setLevel(4).setHandler((info) => {
      info.sock.writeq(info.val.acc);
    });

    this.commands.eval = new Command();
    this.commands.eval.addBranch(
      '...',
      'Executes the given JS code'
    ).setLevel(4).setHandler((info) => {
      try {
        info.reply('Result: ' + require('util').inspect(eval(info.val.acc)));
      } catch (e) {
        info.reply(`Error: ${e.toString()}`);
      }
    });
  }

  handlePing(sock, target) {
    sock.write(`PONG :${target}`);
  }

  handleCode(sock, code, extra) {
    if (code == '001') {
      for (var c of sock.autojoin) {
        sock.join(c);
      }
    }
  }
}