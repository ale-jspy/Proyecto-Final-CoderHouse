// src/managers/CartManager.js
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

//_id -> id (string)
const mapCart = (doc) => {
    if (!doc) return null;
    const c = doc.toObject ? doc.toObject() : doc;
    return {
        id: String(c._id),
        products: Array.isArray(c.products)
            ? c.products.map(p => ({
                product: typeof p.product === 'object' && p.product !== null
                    ? {
                        id: String(p.product._id),
                        title: p.product.title,
                        price: p.product.price,
                        category: p.product.category,
                        status: p.product.status,
                        stock: p.product.stock,
                        thumbnails: p.product.thumbnails || []
                    }
                    : String(p.product),
                quantity: p.quantity
            }))
            : [],
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
    };
};

class CartManager {
    constructor(_ignoredPath) {
    }

    async createCart() {
        const cart = await Cart.create({ products: [] });
        return mapCart(cart);
    }

    async getCartById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const cart = await Cart.findById(id).lean();
        if (!cart) return null;

        // Para compatibilidad con el formato de respuesta
        return {
            id: String(cart._id),
            products: cart.products.map(p => ({
                product: String(p.product),
                quantity: p.quantity
            })),
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt
        };
    }

    // Agrega +1 (o crea) un producto en el carrito
    async addProductToCart(cid, pid) {
        if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) return null;

        const exists = await Product.exists({ _id: pid });
        if (!exists) throw new Error('Product not found');

        const cart = await Cart.findById(cid);
        if (!cart) return null;

        const idx = cart.products.findIndex(p => String(p.product) === String(pid));
        if (idx >= 0) {
            cart.products[idx].quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }
        await cart.save();

        // Devuelve con ids como strings (compat)
        return {
            id: String(cart._id),
            products: cart.products.map(p => ({
                product: String(p.product),
                quantity: p.quantity
            })),
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt
        };
    }

    // ===== Métodos extra para cumplir la entrega solicitada =====

    // Trae el carrito con productos "populate"
    async getCartByIdPopulated(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const cart = await Cart.findById(id).populate('products.product');
        return mapCart(cart);
    }

    // Actualiza SOLO la cantidad de un producto
    async updateProductQuantity(cid, pid, quantity) {
        if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) return null;
        const q = parseInt(quantity, 10);
        if (!Number.isInteger(q) || q < 1) throw new Error('quantity must be integer >= 1');

        const cart = await Cart.findById(cid);
        if (!cart) return null;

        const item = cart.products.find(p => String(p.product) === String(pid));
        if (!item) return 'NOT_IN_CART';

        item.quantity = q;
        await cart.save();
        return mapCart(cart);
    }

    // Reemplaza TODO el arreglo de productos: [{ product, quantity }]
    async replaceProducts(cid, products) {
        if (!mongoose.isValidObjectId(cid)) return null;
        if (!Array.isArray(products)) throw new Error('products must be an array');

        const ids = products.map(p => p.product).filter(Boolean);
        const count = await Product.countDocuments({ _id: { $in: ids } });
        if (count !== ids.length) throw new Error('One or more products do not exist');

        const normalized = products.map(p => ({
            product: p.product,
            quantity: Number.isInteger(p.quantity) && p.quantity > 0 ? p.quantity : 1
        }));

        const cart = await Cart.findByIdAndUpdate(
            cid,
            { $set: { products: normalized } },
            { new: true }
        ).populate('products.product');

        return mapCart(cart);
    }

    // Elimina un producto del carrito
    async deleteProductFromCart(cid, pid) {
        if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) return null;

        const cart = await Cart.findById(cid);
        if (!cart) return null;

        cart.products = cart.products.filter(p => String(p.product) !== String(pid));
        await cart.save();
        return mapCart(cart);
    }

    // Vacía el carrito
    async emptyCart(cid) {
        if (!mongoose.isValidObjectId(cid)) return null;
        const cart = await Cart.findByIdAndUpdate(cid, { $set: { products: [] } }, { new: true });
        return mapCart(cart);
    }
}

module.exports = CartManager;