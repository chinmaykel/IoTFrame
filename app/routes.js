module.exports = function(app, passport) {
    app.get('/', function (req, res) {
            res.render('index.ejs', {message: req.flash('loginMessage')});
        }
    );

    app.post('/login', passport.authenticate('local-login', {
            failureRedirect: '/',
            failureFlash: true
        }), function (req, res) {
            if (res.req.user.valueOf().access_level == '1')
                res.redirect('/profile');
            else
                res.redirect('/user2');
        }
    );

    app.get('/user2', isLoggedIn, function(req, res)
    {
        var mysql = require('mysql');
        var dbconfig = require('./database');
        var connection = mysql.createConnection(dbconfig.connection);
        connection.query('USE ' + dbconfig.database);
        var countQuery = "SELECT * FROM device_tb;";
        connection.query(countQuery, function(err, rows, fields)
        {
            if(err)
                console.log("hello");
            else
            {
                console.log(rows.length);
                for (i=0;i<rows.length;i++)
                {
                    var name = rows[i].id;
                }
                res.render('user.ejs', {val : rows})
            };
        });
    });


    app.get('/forget', function(req, res)
    {
        res.render('forget.ejs',{message: req.flash('signupMessage')});
    });

    app.post('/forget', function(req, res)
    {
        var mysql = require('mysql');
        var bcrypt = require('bcrypt-nodejs');
        var dbconfig = require('./database');
        var connection = mysql.createConnection(dbconfig.connection);
        connection.query('USE ' + dbconfig.database);
        var fpwd =
        {
            frgtun: req.body.funame,
            frgtml: req.body.fuemail,
            cpwd: req.body.cpwds
        };
        var checkQuery = "SELECT * FROM user_info WHERE username = ?";
        connection.query(checkQuery,[fpwd.frgtun], function(err, rows)
        {
            if(rows[0].e_mail == fpwd.frgtml)
            {
                var chngpwd = {pwdchn: bcrypt.hashSync(fpwd.cpwd),}
                var pwdQuery = "UPDATE user_info SET password = ? WHERE username = ?";
                connection.query(pwdQuery,[chngpwd.pwdchn, fpwd.frgtun])
                res.redirect('/');
            }
        })
    });

    app.get('/signup', function(req, res)
    {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup',
    {
        successRedirect : '/user2',
        failureRedirect : '/signup',
        failureFlash : true
    }));

    app.get('/profile', isLoggedIn, function(req, res)
    {
        var mysql = require('mysql');
        var bcrypt = require('bcrypt-nodejs');
        var dbconfig = require('./database');
        var connection = mysql.createConnection(dbconfig.connection);
        connection.query('USE ' + dbconfig.database);
        var countQuery = "SELECT * FROM device_tb;";
        connection.query(countQuery, function(err, rows, fields)
        {
            if(err)
                console.log("hello");
            else
            {
                for (i=0;i<rows.length;i++)
                var name = rows[i].id;
                res.render('profile.ejs', {val : rows})
            };
        });
    });

    app.post('/profile', function(req, res)
    {
        var mysql = require('mysql');
        var bcrypt = require('bcrypt-nodejs');
        var dbconfig = require('./database');
        var connection = mysql.createConnection(dbconfig.connection);
        connection.query('USE ' + dbconfig.database);
        var devices = {
            device: req.body.device_id,
            remove: req.body.u,
            delu: req.body.userremove,
            adddevice: req.body.d_id,
            dmanu: req.body.manu,
            dtype: req.body.d_type,
            dstatus: "Online",
            chngu: req.body.department,
            uschnm: req.body.chngun,
            dcat: "BM"
        };
        console.log(devices.chngu);

        //ADD DEVICES
        if(devices.adddevice != null)
        {
            var insertQuery = "INSERT INTO device_tb ( device_id, manufacturer, device_type, status_dvice, category) values (?,?,?,?,?)";
            connection.query(insertQuery,[devices.adddevice, devices.dmanu, devices.dtype, devices.dstatus, devices.dcat])
        }
        //DELETE DEVICES

        var deleteQuery = "DELETE FROM device_tb WHERE device_id= ?  ";
        console.log(devices.remove);
        connection.query(deleteQuery,[devices.remove])

        //DELETE USER
        var delQuery = "DELETE FROM user_info WHERE username= ?  ";
        connection.query(delQuery,[devices.delu])

        //CHANGE ACCESS LEVEL
        var changeQuery = "UPDATE user_info SET access_level = ? WHERE username = ?";
        connection.query(changeQuery,[devices.chngu, devices.uschnm])

        res.redirect('/profile')
    });

    app.get('/logout', function(req, res)
    {
        req.logout();
        req.session.destroy();
        res.redirect('/');
    });
};

    function isLoggedIn(req, res, next)
    {
        if (req.isAuthenticated() && req.sessionID != null)
            return next();
        res.redirect('/');
    }