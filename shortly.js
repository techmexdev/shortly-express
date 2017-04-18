var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var Crypto = require('crypto-js');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var session = require('express-session');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'hello',
  resave: null,
  saveUninitialized: null,
}));

app.get('/', restrict,
function(req, res) {
  res.render('index');
});

app.get('/create', restrict,
function(req, res) {
  res.render('index');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.get('/links', restrict,
function(req, res) {
  Links.fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/post', function(request, response) {
  var username = request.body.username;
  var password = request.body.password;
  console.log('username / password', username, password);
});

app.post('/login', function(request, response) {
  new User({'username': request.body.username})
          .fetch()
          .then((model) => {
            if (model === null) {
              response.redirect('/login');
            } else if ((request.body.password) === model.attributes['password']) {
              request.session.name = request.body.username;
              response.redirect('/');
            }
          }).then(response.end);
});

app.post('/signup', function(request, response) {
  console.log(Crypto.SHA3(request.body.password));
  new User({
    'username': request.body.username,
    'password': request.body.password//Crypto.SHA3(request.body.password)
  }).save().then(function(msg) {
    var options = {
      'method': 'POST',
      'followAllRedirects': true,
      'uri': 'http://127.0.0.1:4568/login',
      'json': {
        'username': request.body.username,
        'password': request.body.password//Crypto.SHA3(request.body.password)
      }
    };
  });
  request.session.name = request.body.username;
  response.redirect('/');
  response.end();
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
function restrict(req, res, next) {
 // console.log('------------ session name: ', req.session.name);
  if (req.session.name) {
    next();
  } else {
    //req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
