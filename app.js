var express  = require('express');
var passport = require('passport');
var flash    = require('connect-flash');
var bodyParser = require('body-parser');
var app      = express();
var port     = process.env.PORT || 8080;
var session  = require('express-session');
var morgan = require('morgan');

require('./app/passport')(passport);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(session({
    secret: 'thereisnosecretingredient',
    resave: true,
    unset: 'destroy',
    saveUninitialized: true
})
);

app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {req.username = req.session.username; next()})
app.use(express.static(__dirname + '/public/stylesheets'));
app.use(express.static(__dirname + '/public/images'));

require('./app/routes.js')(app, passport);


app.listen(port);
console.log('Server started at ' + port);