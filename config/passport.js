var passport =require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id,done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField:'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req,email,password,done){
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('re_password', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error',messages));
    }
    User.findOne({'email': email}, function(err,user){
        if(err){
            return done(err);
        }
        if(user){
            return done (null, false, {message: 'Email is already taken.'})
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err,result){
            if(err){
                return done(err);

            }
            newUser.hashedId = bcrypt.hashSync(newUser._id, bcrypt.genSaltSync(10),null);
            newUser.save();
            return done(null, newUser);
        })
    }); 
}));

passport.use('local.signin',new LocalStrategy({
    usernameField:'email',
    passwordField: 'password',
    passReqToCallback: true
},function(req,email,password,done){
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error',messages));
    }
    
    User.findOne({'email': email}, function(err,user){
        if(err){
            return done(err);
        }
        if(!user){
            return done (null, false, {message: 'User does not exist'});
        }
        if(!user.validPassword(password)){
            return done (null, false, {message: 'Wrong password'});
        }
        // if(!user.active){
        //     return done (null, false, {message: 'Inactive User'});
        // }
        return done(null, user);
    }); 
}));