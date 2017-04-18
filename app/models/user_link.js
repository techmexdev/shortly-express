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
    return this.belongsTo(User);
  },
  link: function() {
    return this.belongsTo(Link);
  }
});

module.exports = UserLink;