const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    notionID: {
        type: String,
    }
});

module.exports = mongoose.model('Ingredient', IngredientSchema);