var db = require('../config');
var User = require('./user');
var Link = require('./link');
var crypto = require('crypto');

var UserLink = db.Model.extend({
  tableName: 'user_links',
  hasTimestamps: true,
  defaults: {
    visits: 0
  },
  user: function() {
    return this.hasMany(User);
  },
  link: function() {
    return this.hasMany(Link);
  }
});

module.exports = UserLink;