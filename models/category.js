var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    categoryName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    description: { type: String, required: true },
    picture: { type: String },
});

// Virtual for category's URL
CategorySchema.virtual('url').get(function () {
    return '/catalog/category/' + this._id;
});

//Export model
module.exports = mongoose.model('Category', CategorySchema);
