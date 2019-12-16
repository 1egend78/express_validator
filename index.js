var express = require('express');
var exhbs = require('express-handlebars');
var bodyParser = require('body-parser');
var expValChecker = require('express-validator');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/users');

var check = expValChecker.check; // Get references to the 2 validation functions
var validationResult = expValChecker.validationResult;

var port = 3000;

//Connect database
mongoose.connect(
  //Database name lebonplan
  process.env.MONGODB_URI || "mongodb://localhost:27017/express_validator",
  {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
  },
  function (err) {
      if (err !== null) {
          console.log('Dabatase connection err', err);
          return;
      }
      console.log('Database connected');
  }
);

//Create App and express configuration
var app = express();
app.engine('handlebars', exhbs());
app.set('view engine','handlebars');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Enable session management
app.use(
  expressSession({
      secret: "konexioasso07",
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

//Enable Passport
app.use(passport.initialize());
app.use(passport.session());

//Passport Configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // Save the user.id to the session
passport.deserializeUser(User.deserializeUser());
// Receive the user.id from the session and fetch the User from the DB by its ID


//List all user's list
app.get('/', function (req, res) {
    console.log('GET /');
    res.render('home');
});

//Signup route
app.get('/users/add', function (req, res) {
    console.log('GET /signup');
    res.render('signup');
});

//Signup Post
app.post('/users/add',
body("username").isLength({ max: 4 }),
body("password").isLength({ max: 8 }),
  function(req, res) {
    console.log("User sign up");
    var errors = validationResult(req); 
    
    if (errors.isEmpty() === false) {
      res.json({
          errors: errors.array() // to be used in a json loop
      });
      return;
  } else {
    var username = req.body.username;
    var password = req.body.password;
    var city = req.body.city;

    // User.register(model, password, callback);
    User.register(
        new User({
            username: username,
            city: city
            // other fields can be added here
        }),
        password, // password will be hashed
        function (err, user) {
            if (err) {
                console.log("/signup user register err", err);
                return res.render('signup');
            } else {     
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/");
                });
            }
        }
    );
    res.json({
        success: true,
        message: 'User will be saved'
    });
  }
});

//Server listening port
app.listen(port, function () {
    console.log('Server started on port', port);
});