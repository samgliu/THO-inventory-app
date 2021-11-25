var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { body, validationResult } = require('express-validator');

var async = require('async');
const category = require('../models/category');

/// ITEM ROUTES ///

// GET request for one Item.
exports.item_detail = function (req, res, next) {
    async.parallel(
        {
            item: function (callback) {
                Item.findById(req.params.id)
                    .populate('category')
                    .exec(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            if (results.item == null) {
                // No results.
                var err = new Error('Item not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('item_detail', {
                item: results.item,
            });
        }
    );
};
// GET request for list of all Item items.

exports.item_list = function (req, res, next) {
    Item.find({})
        .sort({ itemName: 1 })
        .populate('category')
        .exec(function (err, list_items) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('item_list', {
                title: 'Item List',
                item_list: list_items,
            });
        });
};

// GET request for creating a Item. NOTE This must come before routes that display Item (uses id).
exports.item_create_get = function (req, res, next) {
    async.parallel(
        {
            categories: function (callback) {
                Category.find(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            res.render('item_form', {
                title: 'Create Item',
                item: undefined,
                categories: results.categories,
            });
        }
    );
};
// POST request for creating Item.
exports.item_create_post = [
    (req, res, next) => {
        next();
    },

    // Validate and sanities fields.
    body('item_name', 'Name must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('item_description', 'Description must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('item_pic', 'Picture must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('item_price', 'Price must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('item_quantity', 'Quantity must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('category.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var item = new Item({
            itemName: req.body.item_name,
            description: req.body.item_description,
            picture: req.body.item_pic,
            category: req.body.category,
            price: req.body.item_price,
            quantity: req.body.item_quantity,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all Category for form.
            async.parallel(
                {
                    categories: function (callback) {
                        Category.find(callback);
                    },
                },
                function (err, results) {
                    if (err) {
                        return next(err);
                    }

                    // Mark our selected genres as checked.
                    for (let i = 0; i < results.categories.length; i++) {
                        if (
                            item.category.indexOf(results.categories[i]._id) >
                            -1
                        ) {
                            results.categories[i].checked = 'true';
                        }
                    }
                    res.render('item_form', {
                        title: 'Create Item',
                        categories: results.categories,
                        item: item,
                        errors: errors.array(),
                    });
                }
            );
            return;
        } else {
            // Data from form is valid. Save .
            item.save(function (err) {
                if (err) {
                    return next(err);
                }
                //successful - redirect to new  record.
                res.redirect(item.url);
            });
        }
    },
];

// GET request to delete Item.
exports.item_delete_get = function (req, res, next) {
    async.parallel(
        {
            item: function (callback) {
                Item.findById(req.params.id).exec(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            // Successful, so render.
            res.render('item_delete', {
                title: 'Delete Item',
                item: results.item,
            });
        }
    );
};
// POST request to delete Item.
exports.item_delete_post = function (req, res, next) {
    async.parallel(
        {
            item: function (callback) {
                Item.findById(req.body.itemid).exec(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            // Success
            Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
                if (err) {
                    return next(err);
                }
                // Success - go to author list
                res.redirect('/catalog/items');
            });
        }
    );
};

// GET request to update Item.
exports.item_update_get = function (req, res, next) {
    async.parallel(
        {
            item: function (callback) {
                Item.findById(req.params.id)
                    .populate('category')
                    .exec(callback);
            },
            categories: function (callback) {
                Category.find(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            if (results.item == null) {
                // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected as checked.
            res.render('item_form', {
                title: 'Update Item',
                categories: results.categories,
                item: results.item,
            });
        }
    );
};
// POST request to update Item.
exports.item_update_post = [
    // Convert the genre to an array
    (req, res, next) => {
        next();
    },
    // Validate and sanities fields.
    body('item_name', 'Name must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('item_description', 'Description must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('item_pic', 'Picture must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('item_price', 'Price must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('item_quantity', 'Quantity must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('category.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a object with escaped and trimmed data.
        var item = new Item({
            itemName: req.body.item_name,
            description: req.body.item_description,
            picture: req.body.item_pic,
            category: req.body.category,
            price: req.body.item_price,
            quantity: req.body.item_quantity,
            _id: req.params.id, //This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cats for form.
            async.parallel(
                {
                    categories: function (callback) {
                        Category.find(callback);
                    },
                },
                function (err, results) {
                    if (err) {
                        return next(err);
                    }

                    // Mark our selected as checked.
                    for (let i = 0; i < results.categories.length; i++) {
                        if (
                            item.category.indexOf(results.categories[i]._id) >
                            -1
                        ) {
                            results.categories[i].checked = 'true';
                        }
                    }
                    res.render('item_form', {
                        title: 'Create Item',
                        categories: results.categories,
                        item: item,
                        errors: errors.array(),
                    });
                }
            );
            return;
        } else {
            // Data from form is valid. Update the record.
            Item.findByIdAndUpdate(
                req.params.id,
                item,
                {},
                function (err, theItem) {
                    if (err) {
                        return next(err);
                    }
                    // Successful - redirect to detail page.
                    res.redirect(theItem.url);
                }
            );
        }
    },
];
