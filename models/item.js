var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    picture: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

// Virtual for item's URL
ItemSchema.virtual('url').get(function () {
    return '/catalog/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);
