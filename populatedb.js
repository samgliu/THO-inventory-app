#! /usr/bin/env node

console.log(
    'This script populates some test data to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Item = require('./models/item');
var Category = require('./models/category');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = [];
var categories = [];

function categoryCreate(name, description, picture, cb) {
    categorydetail = {
        categoryName: name,
        description: description,
        picture: picture,
    };
    var category = new Category(categorydetail);

    category.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Category: ' + category);
        categories.push(category);
        cb(null, category);
    });
}

function itemCreate(name, description, picture, category, price, quantity, cb) {
    itemdetail = {
        itemName: name,
        description: description,
        picture: picture,
        category: category,
        price: price,
        quantity: quantity,
    };

    var item = new Item(itemdetail);
    item.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Item: ' + item);
        items.push(item);
        cb(null, item);
    });
}

function createCategories(cb) {
    async.series(
        [
            function (callback) {
                categoryCreate(
                    'Sports',
                    'sports category',
                    'https://upload.wikimedia.org/wikipedia/commons/1/11/Argentinische_Ruckhand.JPG',
                    callback
                );
            },
            function (callback) {
                categoryCreate(
                    'Food',
                    'food category',
                    'https://upload.wikimedia.org/wikipedia/commons/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg',
                    callback
                );
            },
            function (callback) {
                categoryCreate(
                    'Suit',
                    'suit category',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Double_Breasted_Striped_%28Ropestripe%29_%E2%80%93_Dark_Brown_Pinstripe_Suit.jpg/440px-Double_Breasted_Striped_%28Ropestripe%29_%E2%80%93_Dark_Brown_Pinstripe_Suit.jpg',
                    callback
                );
            },
            function (callback) {
                categoryCreate(
                    'Tools',
                    'tool category',
                    'https://upload.wikimedia.org/wikipedia/commons/f/f4/20060513_toolbox.jpg',
                    callback
                );
            },
        ],
        // optional callback
        cb
    );
}

function createItems(cb) {
    async.parallel(
        [
            function (callback) {
                itemCreate(
                    'adidas gray bag',
                    'an adidas gray bag.',
                    'https://m.media-amazon.com/images/I/A1IX0IDZyJL._AC_SL1500_.jpg',
                    categories[0],
                    23.99,
                    98,
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    'adidas Small Bag',
                    'an adidas small bag.',
                    'https://m.media-amazon.com/images/I/91afPfvlLlL._AC_SX522_.jpg',
                    categories[0],
                    27.99,
                    68,
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    'cookie cup',
                    'cookies',
                    'https://m.media-amazon.com/images/I/71ENNRFHnZL._SL1100_.jpg',
                    categories[1],
                    17.99,
                    18,
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    'Screwdriver Set',
                    '7 Piece Cushion-Grip Screwdriver Set',
                    'https://m.media-amazon.com/images/I/61OuwgKCXkL._SL1000_.jpg',
                    categories[3],
                    47.99,
                    8,
                    callback
                );
            },
            function (callback) {
                itemCreate(
                    'Tool Set',
                    'Diagonal Cutters, and Long Nose Pliers',
                    'https://m.media-amazon.com/images/I/614NRuwRAXL._AC_SL1000_.jpg',
                    categories[3],
                    33.99,
                    9,
                    callback
                );
            },
        ],
        // optional callback
        cb
    );
}

async.series(
    [createCategories, createItems],
    // Optional callback
    function (err, results) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        } else {
            console.log('Categories: ' + categories);
        }
        // All done, disconnect from database
        mongoose.connection.close();
    }
);
