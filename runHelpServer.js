const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

module.exports = (bot, lvl) => {
  var logger = require('./newLogger')(lvl, 'help');
  var helpServer = express();
  
  helpServer.set('view engine', 'pug')
  helpServer.set('views', path.join(__dirname, 'public'));

  helpServer.use(serveStatic(path.join(require.resolve('bootstrap').match(/^.*[\/\\]node_modules[\/\\][^\/\\]*/)[0], 'dist/css')));

  helpServer.use(serveStatic(path.join(__dirname, 'assets')));
  helpServer.use(serveStatic(path.join(require.resolve('jquery').match(/^.*[\/\\]node_modules[\/\\][^\/\\]*/)[0], 'dist')));
  helpServer.use(serveStatic(path.join(require.resolve('popper.js').match(/^.*[\/\\]node_modules[\/\\][^\/\\]*/)[0], 'dist/umd')));
  helpServer.use(serveStatic(path.join(require.resolve('bootstrap').match(/^.*[\/\\]node_modules[\/\\][^\/\\]*/)[0], 'dist/js')));
  helpServer.use(serveStatic(path.join(require.resolve('turbolinks').match(/^.*[\/\\]node_modules[\/\\][^\/\\]*/)[0], 'dist')));

  helpServer.get('/', (req, res) => {
    res.render('index', { req: req, res: res, bot: bot, page: 'index' });
  });

  helpServer.get('/plugin', (req, res) => {
    res.render('plugin', { req: req, res: res, bot: bot, page: 'plugin', permLevels: bot.permLevels });
  });

  helpServer.listen(bot.helpServerPort, () => {
    logger.important(`Serving help on http://${bot.helpServerHost}:${bot.helpServerPort}`)
  });

  return helpServer;
}