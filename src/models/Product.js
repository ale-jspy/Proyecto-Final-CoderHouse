const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // <-- para la pauta
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

// índices sugeridos para búsquedas
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ stock: 1 });

module.exports = mongoose.model('Product', productSchema);