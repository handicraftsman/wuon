const Command = require('../Command');

module.exports = class extends (require('../Plugin')) {
  constructor() {
    super();
    this.name = 'ChanOP';
    this.version = '0.1.0';
    this.description = 'The chanop plugin';

    this.commands.kick = new Command();
    this.commands.kick.addBranch(
      'nick -ban =reason =channel',
      'Kicks the given user from the given channel. Bans him if `ban` flag is given'
    ).setLevel(2).setHandler((info) => {
      if (info.val.flags.ban) {
        var host = info.sock.userCache.getHost(info.val.positionals.nick);
        info.sock.userMode(channel, '+b', '*!*@' + host);
      }
      var reason = info.val.options.reason || 'Bye';
      var channel = info.val.options.channel || info.target;
      info.sock.kick(channel, info.val.positionals.nick, reason);
    });

    this.commands.remove = new Command();
    this.commands.remove.addBranch(
      'nick -ban =reason =channel',
      'Removes the given user from the given channel. Bans him if `ban` flag is given'
    ).setLevel(2).setHandler((info) => {
      if (info.val.flags.ban) {
        var host = info.sock.userCache.getHost(info.val.positionals.nick);
        info.sock.userMode(channel, '+b', '*!*@' + host);
      }
      var reason = info.val.options.reason || 'Bye';
      var channel = info.val.options.channel || info.target;
      info.sock.remove(channel, info.val.positionals.nick, reason);
    });

    this.commands.ban = new Command();
    this.commands.ban.addBranch(
      'who -raw =channel',
      'Bans a user. Bans a raw mask if `raw` flag is given'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      var who;
      if (info.val.flags.raw) {
        who = info.val.positionals.who;
      } else {
        who = '*!*@' + info.sock.userCache.getHost(info.val.positionals.who);
      }
      info.sock.userMode(channel, '+b', who);
    });

    this.commands.unban = new Command();
    this.commands.unban.addBranch(
      'who -raw =channel',
      'Unbans a user. Unbans a raw mask if `raw` flag is given'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      var who;
      if (info.val.flags.raw) {
        who = info.val.positionals.who;
      } else {
        who = '*!*@' + info.sock.userCache.getHost(info.val.positionals.who);
      }
      info.sock.userMode(channel, '-b', who);
    });

    this.commands.quiet = new Command();
    this.commands.quiet.addBranch(
      'who =channel',
      'Quiets a user'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      info.sock.userMode(channel, '+q', info.val.positionals.who);
    });

    this.commands.unquiet = new Command();
    this.commands.unquiet.addBranch(
      'who =channel',
      'Unquiets a user'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      info.sock.userMode(channel, '-q', info.val.positionals.who);
    });

    this.commands.exempt = new Command();
    this.commands.exempt.addBranch(
      'who -raw =channel',
      'Exempts a user'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      var who;
      if (info.val.flags.raw) {
        who = info.val.positionals.who;
      } else {
        who = '*!*@' + info.sock.userCache.getHost(info.val.positionals.who);
      }
      info.sock.userMode(channel, '+e', info.val.positionals.who);
    });

    this.commands.unexempt = new Command();
    this.commands.unexempt.addBranch(
      'who -raw =channel',
      'Unexempts a user'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      var who;
      if (info.val.flags.raw) {
        who = info.val.positionals.who;
      } else {
        who = '*!*@' + info.sock.userCache.getHost(who);
      }
      info.sock.userMode(channel, '-e', who);
    });

    this.commands.op = new Command();
    this.commands.op.addBranch(
      'who =channel',
      'Ops a user'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      info.sock.userMode(channel, '+o', info.val.positionals.who);
    });

    this.commands.deop = new Command();
    this.commands.deop.addBranch(
      'who =channel',
      'Deops a user'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      info.sock.userMode(channel, '-o', info.val.positionals.who);
    });

    this.commands.voice = new Command();
    this.commands.voice.addBranch(
      'who =channel',
      'Voices a user'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      info.sock.userMode(channel, '+v', info.val.positionals.who);
    });

    this.commands.devoice = new Command();
    this.commands.devoice.addBranch(
      'who =channel',
      'Devoices a user'
    ).setLevel(2).setHandler((info) => {
      var channel = info.val.options.channel || info.target;
      info.sock.userMode(channel, '-v', info.val.positionals.who);
    });
  }
}