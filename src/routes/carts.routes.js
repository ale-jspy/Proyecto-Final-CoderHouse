const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const cartManager = new CartManager('./src/data/carts.json'); // el path se ignora internamente

// POST /api/carts/ -> crea carrito
router.post('/', async (_req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// GET /api/carts/:cid -> con populate (productos completos)
router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartByIdPopulated(req.params.cid);
        if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        res.json({ status: 'success', payload: cart });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// POST /api/carts/:cid/product/:pid -> agrega producto (suma 1 si ya existe)
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
        if (!updatedCart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        res.json({ status: 'success', payload: updatedCart });
    } catch (e) {
        res.status(400).json({ status: 'error', error: e.message });
    }
});

/* === Endpoints requeridos por la consigna === */

// DELETE /api/carts/:cid/products/:pid -> elimina un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await cartManager.deleteProductFromCart(req.params.cid, req.params.pid);
        if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito o producto no encontrado' });
        res.json({ status: 'success', payload: cart });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// PUT /api/carts/:cid -> reemplaza todos los productos del carrito
// body: { products: [{ product: <productId>, quantity: <number> }, ...] }
router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body;
        const cart = await cartManager.replaceProducts(req.params.cid, products);
        if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        res.json({ status: 'success', payload: cart });
    } catch (e) {
        res.status(400).json({ status: 'error', error: e.message });
    }
});

// PUT /api/carts/:cid/products/:pid -> actualiza SOLO la cantidad
// body: { quantity: <int>=1..n }
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await cartManager.updateProductQuantity(
            req.params.cid,
            req.params.pid,
            req.body.quantity
        );
        if (cart === null) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        if (cart === 'NOT_IN_CART') return res.status(404).json({ status: 'error', error: 'Producto no está en el carrito' });
        res.json({ status: 'success', payload: cart });
    } catch (e) {
        res.status(400).json({ status: 'error', error: e.message });
    }
});

// DELETE /api/carts/:cid -> vacía el carrito
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.emptyCart(req.params.cid);
        if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        res.json({ status: 'success', payload: cart });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

module.exports = router;