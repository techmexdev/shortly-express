var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var UserLink = require('./user_link');
var Link = require('./link');



var User = db.Model.extend({
  tableName: 'users',
  hasTimeStamps: true,
  userLink: function() {
    return this.belongsToMany(Link).through(UserLink);
  }
});

module.exports = User;
