var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function(err,result){
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i <result.length; i+= chunkSize){
      productChunks.push(result.slice(i, i+chunkSize));
    }
    res.render('shop/index', { title: 'Video Game Shop', productChunks: productChunks, successMsg: successMsg, noMessages: !successMsg });
  });
});

router.get('/add-to-cart/:id',function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {items:{}, totalQty: 0, totalPrice:0});
  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/');
  });
});

router.get('/remove/:id',function(req,res,next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {items:{}, totalQty: 0, totalPrice:0});
    cart.removeByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove-all/:id',function(req,res,next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {items:{}, totalQty: 0, totalPrice:0});
    cart.removeAll(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});
router.get('/shopping-cart',function(req,res,next){
  if(!req.session.cart){
    return res.render('shop/cart',{produts: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/cart',{products: cart.generateArray(),totalPrice: cart.totalPrice})
});

router.get('/checkout', isLoggedIn,function(req,res,next){
  if(!req.session.cart){
    return res.redirect('/cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout',{total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg})

});

router.post('/checkout', isLoggedIn,function(req,res,next){
  if(!req.session.cart){
    return res.redirect('/cart');
  }
  var cart = new Cart(req.session.cart);
  var stripe = require("stripe")(
  "sk_test_31eXlhhwet5StsonYPOuTs2c"
  );

  stripe.charges.create({
    amount: cart.totalPrice*100,
    currency: "cad",
    source: req.body.stripeToken, 
    description: "Charge Game"
  }, function(err, charge) {
    // asynchronously called
    if(err){
      req.flash('error',err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    })
    order.save(function(err,result){
      req.flash('success','Payment processed successfully!');
      req.session.cart = null ;
      res.redirect('/');
    });
  });
})
module.exports = router;

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}


function notLoggedIn(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }

    res.redirect('/user/signin');
}