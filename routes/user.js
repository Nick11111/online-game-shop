var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

//var helper = require('sendgrid').mail;
//var sg = require('sendgrid')('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');


var csrfProtect =csrf();
router.use(csrfProtect);

router.get('/profile', isLoggedIn, function(req,res,next){
    Order.find({user: req.user},function(err,orders){
        if(err){
            return res.write('Error!');
        }
        var cart;
        orders.forEach (function(order){
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile',{ orders: orders });
    });
});

router.get('/logout', isLoggedIn, function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.use('/',notLoggedIn,function(req,res,next){
    next();
});
router.get ('/signup', function(req,res,next){
  var messages = req.flash('error');
  res.render('user/signup',{csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length>0 })
});

router.post ('/signup', passport.authenticate('local.signup',{
  failureRedirect: 'signup',
  failureFlash:true
}),function(req,res,next){
    if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl= null;
        res.redirect(oldUrl);
    }
    else {
    res.redirect('/user/profile');
    }
}
// , sendEmail, function(req,res,next)
// {

    // var from_email = new helper.Email('test@example.com');
    // var to_email = new helper.Email(req.user.email);
    // var subject = 'Hello World from the SendGrid Node.js Library!';   
    // if(req.session.oldUrl){
    //     var oldUrl = req.session.oldUrl;
    //     req.session.oldUrl= null;
    //     var content = new helper.Content('text/plain', 'Hello, Email!');
    //     var mail = new helper.Mail(from_email, subject, to_email, content);
    //     var request = sg.emptyRequest({
    //     method: 'POST',
    //     path: '/v3/mail/send',
    //     body: mail.toJSON(),
    //     });
        
    //     sg.API(request, function(error, response) {
    //     console.log(response.statusCode);
    //     console.log(response.body);
    //     console.log(response.headers);
    //     });
    // }
    // else {
        // var content = new helper.Content('text/plain', 'Hello, Email! http://localhost:3000/user/activate/'+req.user.hashedId);
        // var mail = new helper.Mail(from_email, subject, to_email, content);
        // var request = sg.emptyRequest({
        // method: 'POST',
        // path: '/v3/mail/send',
        // body: mail.toJSON(),
        // });
        
        // sg.API(request, function(error, response) {
        //     // console.log(response.statusCode);
        //     // console.log(response.body);
        //     // console.log(response.headers);
        //     response.redirect('/');
        //  });
   
        //res.redirect('/');
   // } 
//}
);


router.get('/signin', function(req,res,next){
    var messages = req.flash('error');
  res.render('user/signin',{csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length>0 })
});

router.post('/signin', passport.authenticate('local.signin',{
  failureRedirect: 'signin',
  failureFlash:true
}),function(req,res,next){
    if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl= null;
        res.redirect(oldUrl);
    }
    else {
    res.redirect('/user/profile');
    }
});

router.get('/activate/:hashedId', function(req, res, next){
    User.findOne({'hashedId': req.params.hashedId}, function(err,user){
        if(err){
            console.log(err);
        }
        user.active = true;
        user.save();
        res.redirect('/user/signin');
    });    
});

module.exports = router;

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}


function notLoggedIn(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

// function sendEmail(req, res, next){

//     var from_email = new helper.Email('test@example.com');
//     var to_email = new helper.Email(req.user.email);
//     var subject = 'Hello World from the SendGrid Node.js Library!';   
    // if(req.session.oldUrl){
    //     var oldUrl = req.session.oldUrl;
    //     req.session.oldUrl= null;
    //     var content = new helper.Content('text/plain', 'Hello, Email!');
    //     var mail = new helper.Mail(from_email, subject, to_email, content);
    //     var request = sg.emptyRequest({
    //     method: 'POST',
    //     path: '/v3/mail/send',
    //     body: mail.toJSON(),
    //     });
        
    //     sg.API(request, function(error, response) {
    //     console.log(response.statusCode);
    //     console.log(response.body);
    //     console.log(response.headers);
    //     });
    // }
    // else {
        // var content = new helper.Content('text/plain', 'Hello, Email! http://localhost:3000/user/activate/'+req.user.hashedId);
        // var mail = new helper.Mail(from_email, subject, to_email, content);
        // var request = sg.emptyRequest({
        // method: 'POST',
        // path: '/v3/mail/send',
        // body: mail.toJSON(),
        // });
        
        // sg.API(request, function(error, response) {
        //     console.log(response.statusCode);
        //     console.log(response.body);
        //     console.log(response.headers);
        //     //response.redirect('/');
        //     return next();
        //  });
//}