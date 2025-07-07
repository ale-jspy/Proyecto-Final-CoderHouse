const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager('./src/data/products.json');

// GET /api/products/
router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.json(products);
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
});

// POST /api/products/
router.post('/', async (req, res) => {
    const {
        title, description, code, price, stock, category, thumbnails
    } = req.body;

    if (!title || !description || !code || !price || !stock || !category || !thumbnails) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const newProduct = await productManager.addProduct({
        title, description, code, price, stock, category, thumbnails
    });

    res.status(201).json(newProduct);
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    const updated = await productManager.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
    await productManager.deleteProduct(req.params.pid);
    res.json({ message: 'Producto eliminado' });
});

module.exports = router;