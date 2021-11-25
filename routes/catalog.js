var express = require('express');
const path = require('path');
var router = express.Router();

// Require controller modules.
var item_controller = require('../controllers/itemController');
var category_controller = require('../controllers/categoryController');

// upload multer
const multer = require('multer');
var upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/uploads');
        },
        filename: function (req, file, callback) {
            callback(
                null,
                file.fieldname +
                    '-' +
                    Date.now() +
                    path.extname(file.originalname)
            );
        },
    }),
});

// GET catalog home page.
router.get('/', category_controller.index);

/// CATEGORY ROUTES ///

// GET request for creating a Catetory. NOTE This must come before route that displays Category (uses id).
router.get('/category/create', category_controller.category_create_get);

//POST request for creating Category.
router.post(
    '/category/create',
    upload.single('picture'), // upload img
    category_controller.category_create_post
);

// GET request to delete Category.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete Category.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update Category.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update Category.
router.post(
    '/category/:id/update',
    upload.none(),
    category_controller.category_update_post
);

// GET request for one Category.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all Category.
router.get('/categories', category_controller.category_list);

/// ITEM ROUTES ///

// GET request for creating a Item. NOTE This must come before routes that display Item (uses id).
router.get('/item/create', item_controller.item_create_get);

// POST request for creating Item.
router.post(
    '/item/create',
    upload.single('picture'),
    item_controller.item_create_post
);

// GET request to delete Item.
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete Item.
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update Item.
router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update Item.
router.post(
    '/item/:id/update',
    upload.none(),
    item_controller.item_update_post
);

// GET request for one Item.
router.get('/item/:id', item_controller.item_detail);

// GET request for list of all Item items.
router.get('/items', item_controller.item_list);

module.exports = router;
