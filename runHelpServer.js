const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

module.exports = (bot, lvl) => {
  var logger = require('./newLogger')(lvl, 'help');
  var helpServer = express();
  
  helpServer.set('view engine', 'pug')
  helpServer.set('views', path.join(__dirname, 'public'));

  helpServer.use(serveStatic(path.join(__dirname, 'node_modules/bootstrap/dist/css')));

  helpServer.use(serveStatic(path.join(__dirname, 'assets')));
  helpServer.use(serveStatic(path.join(__dirname, 'node_modules/jquery/dist')));
  helpServer.use(serveStatic(path.join(__dirname, 'node_modules/popper.js/dist/umd')));
  helpServer.use(serveStatic(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
  helpServer.use(serveStatic(path.join(__dirname, 'node_modules/turbolinks/dist')));

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