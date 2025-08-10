const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager('./src/data/products.json'); // el path se ignora internamente

// Arma links de paginación manteniendo otros query params
function buildLink(req, page) {
    const base = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const url = new URL(base);
    for (const [k, v] of Object.entries(req.query || {})) {
        if (k !== 'page' && v != null) url.searchParams.set(k, v);
    }
    url.searchParams.set('page', page);
    // devolvemos relativo porque lo pide la pauta
    return url.pathname + url.search;
}

// GET /api/products?limit=&page=&sort=&query=
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const data = await productManager.getProducts({ limit, page, sort, query });

        // Si por alguna razón devuelve array simple, normaliza la respuesta
        if (Array.isArray(data)) {
            return res.json({
                status: 'success',
                payload: data,
                totalPages: 1,
                prevPage: null,
                nextPage: null,
                page: 1,
                hasPrevPage: false,
                hasNextPage: false,
                prevLink: null,
                nextLink: null
            });
        }

        const {
            docs,
            totalPages,
            prevPage,
            nextPage,
            page: currentPage,
            hasPrevPage,
            hasNextPage
        } = data;

        res.json({
            status: 'success',
            payload: docs,
            totalPages,
            prevPage,
            nextPage,
            page: currentPage,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? buildLink(req, prevPage) : null,
            nextLink: hasNextPage ? buildLink(req, nextPage) : null
        });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
        res.json({ status: 'success', payload: product });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// POST /api/products/
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails, status } = req.body;
        if (!title || price == null || !code || stock == null || !category || !description) {
            return res.status(400).json({ status: 'error', error: 'Faltan campos obligatorios (title, description, code, price, stock, category)' });
        }
        const newProduct = await productManager.addProduct({
            title, description, code, price, stock, category,
            thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
            status
        });
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (e) {
        // índice único de code
        if (e && e.code === 11000) {
            return res.status(409).json({ status: 'error', error: 'El campo "code" debe ser único' });
        }
        res.status(400).json({ status: 'error', error: e.message });
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    try {
        const updated = await productManager.updateProduct(req.params.pid, req.body);
        if (!updated) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
        res.json({ status: 'success', payload: updated });
    } catch (e) {
        res.status(400).json({ status: 'error', error: e.message });
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
    try {
        const ok = await productManager.deleteProduct(req.params.pid);
        if (!ok) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
        res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

module.exports = router;