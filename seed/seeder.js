var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://nick:nick123@ds143990.mlab.com:43990/shop');

var products = [
    new Product({
    imagePath: 'http://www.gamingdragons.com/images/game_img/dota2.jpg',
    title: 'Dota 2',
    description:'My favourite game ever!',
    price: 59

}),

    new Product({
    imagePath: 'http://static.tvtropes.org/pmwiki/pub/images/390438d87f71942db00afdb35b69bff7.jpg',
    title: 'Call of Duty - Black Ops 3',
    description:'My favourite game ever!',
    price: 79

}),
    new Product({
    imagePath: 'http://nba2k17news.com/wp-content/uploads/2016/06/NBA-2k17-Cover.jpg',
    title: 'NBA 2K17',
    description:'My favourite game ever!',
    price: 59

}),
    new Product({
    imagePath: 'http://media.vandal.net/m/30023/titanfall-2-2016612222426_1.jpg',
    title: 'TITANFALL 2',
    description:'My favourite game ever!',
    price: 49

}),
    new Product({
    imagePath: 'https://media.playstation.com/is/image/SCEA/dark-souls-iii-collectors-edition-box-shot-01-ps4-us-10feb16?$TwoColumn_Image$',
    title: 'Dark Souls 3',
    description:'My favourite game ever!',
    price: 39

    }),
];

var done = 0;
for (var i=0; i<products.length; i++){
    products[i].save(function (err, result) {
        done++;
        if (done === products.length){
            exit();
        }
    });
}

function exit(){
    mongoose.disconnect();
}

