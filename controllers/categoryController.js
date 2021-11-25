var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');
const { body, validationResult } = require('express-validator');

var async = require('async');
const category = require('../models/category');

// exports GET catalog home page.
exports.index = function (req, res) {
    async.parallel(
        {
            category_count: function (callback) {
                Category.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
            },
            item_count: function (callback) {
                Item.countDocuments({}, callback);
            },
        },
        function (err, results) {
            res.render('index', {
                title: 'Inventory Management System',
                error: err,
                data: results,
            });
        }
    );
};

/// CATEGORY ROUTES ///

// GET request for one Category.
exports.category_detail = function (req, res, next) {
    async.parallel(
        {
            category: function (callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_items: function (callback) {
                Item.find({ category: req.params.id })
                    .populate('category')
                    .exec(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            } // Error in API usage.
            if (results.category == null) {
                // No results.
                var err = new Error('Author not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            console.log(results.category_items);
            res.render('category_detail', {
                title: 'Category Detail',
                category: results.category,
                category_items: results.category_items,
            });
        }
    );
};

// GET request for list of all Category.
exports.category_list = function (req, res, next) {
    Category.find()
        .sort([['categoryName', 'ascending']])
        .exec(function (err, list_categories) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('category_list', {
                title: 'Category List',
                category_list: list_categories,
            });
        });
};

// GET request for creating a Catetory. NOTE This must come before route that displays Category (uses id).
exports.category_create_get = function (req, res, next) {
    res.render('category_form', { title: 'Create Category' });
};

//POST request for creating Category.
exports.category_create_post = [
    // Validate and santize the name field.
    body('category_name', 'category_pic required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('category_description', 'category_description required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('category_pic', 'category_pic required')
        .trim()
        .isLength({ min: 1 })
        .escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var category = new Category({
            categoryName: req.body.category_name,
            description: req.body.category_description,
            picture: req.body.category_pic,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('category_form', {
                title: 'Create Category',
                category_name: category_name,
                category_description: category_description,
                category_pic: category_pic,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Category.findOne({ categoryName: req.body.category_name }).exec(
                function (err, found_category) {
                    if (err) {
                        return next(err);
                    }

                    if (found_category) {
                        // category exists, redirect to its detail page.
                        res.redirect(found_category.url);
                    } else {
                        category.save(function (err) {
                            if (err) {
                                return next(err);
                            }
                            // category saved. Redirect to category detail page.
                            res.redirect(category.url);
                        });
                    }
                }
            );
        }
    },
];

// GET request to delete Category.
exports.category_delete_get = function (req, res, next) {
    async.parallel(
        {
            category: function (callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_items: function (callback) {
                Item.find({ category: req.params.id })
                    .populate('category')
                    .exec(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            if (results.category == null) {
                // No results.
                res.redirect('/catalog/categories');
            }
            // Successful, so render.
            res.render('category_delete', {
                title: 'Delete Category',
                category: results.category,
                category_items: results.category_items,
            });
        }
    );
};

// POST request to delete Category.
exports.category_delete_post = function (req, res, next) {
    async.parallel(
        {
            category: function (callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_items: function (callback) {
                Item.find({ category: req.params.id })
                    .populate('category')
                    .exec(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            // Success
            if (results.category_items.length > 0) {
                //  Render in same way as for GET route.
                res.render('category_delete', {
                    title: 'Delete Category',
                    category: results.category,
                    category_items: results.category_items,
                });
                return;
            } else {
                // Author has no books. Delete object and redirect to the list of authors.
                Category.findByIdAndRemove(
                    req.body.categoryid,
                    function deleteCategory(err) {
                        if (err) {
                            return next(err);
                        }
                        // Success - go to author list
                        res.redirect('/catalog/categories');
                    }
                );
            }
        }
    );
};

// GET request to update Category.
exports.category_update_get = function (req, res, next) {
    async.parallel(
        {
            category: function (callback) {
                Category.findById(req.params.id).exec(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            if (results.category == null) {
                // No results.
                var err = new Error('Author not found');
                err.status = 404;
                return next(err);
            }
            res.render('category_form', {
                title: 'Update Category',
                category: results.category,
            });
        }
    );
};

// POST request to update Category.
exports.category_update_post = [
    // Convert the genre to an array
    (req, res, next) => {
        next();
    },

    // Validate and santize the name field.
    body('category_name', 'category_pic required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('category_description', 'category_description required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('category_pic', 'category_pic required')
        .trim()
        .isLength({ min: 1 })
        .escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var category = new Category({
            categoryName: req.body.category_name,
            description: req.body.category_description,
            picture: req.body.category_pic,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel(
                {
                    category: function (callback) {
                        Category.find(callback);
                    },
                },
                function (err, results) {
                    if (err) {
                        return next(err);
                    }

                    // Mark our selected genres as checked.
                    res.render('category_form', {
                        title: 'Update Category',
                        category: results.category,
                        errors: errors.array(),
                    });
                }
            );
            return;
        } else {
            // Data from form is valid. Update the record.
            Category.findByIdAndUpdate(
                req.params.id,
                category,
                {},
                function (err, theCat) {
                    if (err) {
                        return next(err);
                    }
                    // Successful - redirect to book detail page.
                    res.redirect(theCat.url);
                }
            );
        }
    },
];
