const Command = require('../Command');

module.exports = class extends (require('../Plugin')) {
  constructor() {
    super();
    this.name = 'Cookies';
    this.version = require('../version');
    this.description = 'The cookie giveaway plugin';
  
    const cookie_qualities = {
      normal: '',
      uncommon: '%C%LBLUEuncommon ',
      rare: '%C%BLUErare ',
      epic: '%C%PURPLEepic ',
      legendary: '%C%YELLOWlegendary ',
      holy: '%C%ORANGEholy ',
      hitech: '%C%CYANhi-tech ',
      quantum: '%C%LBLUEquantum ',
      evil: '%C%BLACKevil ',
      magical: '%C%PURPLEmagical ',
      ancient: '%C%LBLUEancient ',
      vampiric: '%C%REDvampiric ',
    };
    
    const cookie_types = {
      normal: '',

      blazing: '%C%ORANGEblazing ',
      hot: '%C%REDhot ',

      frost: '%C%CYANfrost ',
      chilling: '%C%LBLUEchilling ',

      shocking: '%C%YELLOWshocking ',
      aerial: '%C%LGREYaerial ',

      stone: '%C%GREYstone ',
      mud: '%C%BROWNmud ',

      void: '%C%BLACKvoid ',
      ghostly: '%C%WHITEghostly ',
      bloody: '%C%REDbloody ',
      nyan: '%C%REDn%C%GREENy%C%BLUEa%C%CYANn ',
      teleporting: '%C%CYANteleporting ',
      wild: '%C%BROWNwild ',
      alien: '%C%GREENalien ',
      spacious: '%C%BLACKspacious ',
      atomic: '%C%REDatomic ',
      chocolate: '%C%BROWNchocolate ',
    };

    this.commands.cookie = new Command();
    this.commands.cookie.addBranch(
      '=quality =type',
      'Gives a cookie to the invoker'
    ).setCooldown(10).setHandler((info) => {
      var quality = info.val.options.quality || Object.keys(cookie_qualities)[Math.floor(Math.random()*Object.keys(cookie_qualities).length)];
      var type = info.val.options.type || Object.keys(cookie_types)[Math.floor(Math.random()*Object.keys(cookie_types).length)];
      info.sock.action(info.replyTo, `%Ngives %B${info.nick}%N a %B${cookie_qualities[quality]}${cookie_types[type]}%C%BROWNcookie%N`)
    });
    this.commands.cookie.addBranch(
      'who =quality =type',
      'Gives a cookie to the given user'
    ).setCooldown(10).setHandler((info) => {
      var quality = info.val.options.quality || Object.keys(cookie_qualities)[Math.floor(Math.random()*Object.keys(cookie_qualities).length)];
      var type = info.val.options.type || Object.keys(cookie_types)[Math.floor(Math.random()*Object.keys(cookie_types).length)];
      info.sock.action(info.replyTo, `%Ngives %B${info.val.positionals.who}%N a %B${cookie_qualities[quality]}${cookie_types[type]}%C%BROWNcookie%N`)
    });
  }

}