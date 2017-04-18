var db = require('../config');
var Click = require('./click');
var crypto = require('crypto');
var UserLink = require('./user_link');
var User = require('./user');

var Link = db.Model.extend({
  tableName: 'urls',
  hasTimestamps: true,
  defaults: {
    visits: 0
  },
  userLink: function() {
    return this.belongsToMany(User).through(UserLink);
  },
  clicks: function() {
    return this.hasMany(Click);
  },
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url'));
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
});

module.exports = Link;
