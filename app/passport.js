var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {


    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });


    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM user_info WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({

                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true
            },
            function(req, username, password, done) {

                connection.query("SELECT * FROM user_info WHERE username = ?",[username], function(err, rows) {
                    if (err)
                        return done(err);
                    if (rows.length) {
                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                    } else {
                        // if there is no user with that username
                        // create the user
                        var newUserMysql = {
                            username: username,
                            password: bcrypt.hashSync(password, null, null),  // use the generateHash function in our user model
                            first_name: req.body.fname,
                            last_name: req.body.lname,
                            email: req.body.email,
                            phone: req.body.phone
                        };

                        var insertQuery = "INSERT INTO user_info ( first_name, last_name, e_mail, phone, access_level, username, password ) values (?,?,?,?,?,?,?)";

                        connection.query(insertQuery,[newUserMysql.first_name,newUserMysql.last_name,newUserMysql.email,newUserMysql.phone,1,newUserMysql.username, newUserMysql.password],function(err, rows) {
                            newUserMysql.id = rows.insertId;

                            return done(null, newUserMysql);
                        });
                    }
                });
            })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true
            },
            function(req, username, password, done)
            {
                connection.query("SELECT * FROM user_info WHERE username = ?",[username], function(err, rows)
                {
                    if (err)
                        return done(err);
                    if (!rows.length)
                    {
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    }
                    if (!bcrypt.compareSync(password, rows[0].password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                    return done(null, rows[0]);
                });
            })
    );
};