module.exports = class {
  constructor(sock) {
    this.sock = sock;
    this.cache = {};
  }

  add(nick) {
    this.cache[nick] = { nick: nick };
  }

  has(nick) {
    return (nick in this.cache);
  }

  rename(nick, newNick) {
    if (!this.has(nick)) { this.add(nick); }
    this.cache[newNick] = this.cache[nick];
    this.cache[newNick].nick = newNick;
    delete this.cache[nick];
  }

  remove(nick) {
    delete this.cache[nick];
  }

  setUser(nick, user) {
    if (!this.has(nick)) { this.add(nick); }
    this.cache[nick].user = user;
  }

  setHost(nick, host) {
    if (!this.has(nick)) { this.add(nick); }
    this.cache[nick].host = host;
  }
  
  getUser(nick) {
    if (!(nick in this.cache)) { return undefined; }
    return this.cache[nick].user;
  }

  getHost(nick) {
    if (!(nick in this.cache)) { return undefined; }
    return this.cache[nick].host;
  }
}