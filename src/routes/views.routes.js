const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager('./src/data/products.json');

// Home 
router.get('/', async (_req, res) => {
    const products = await productManager.getProducts(); // lista simple
    res.render('home', { products });
});

// Tiempo real
router.get('/realtimeproducts', async (_req, res) => {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products });
});

// Nueva vista con paginación: /products?limit=&page=&sort=&query=
router.get('/products', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    const data = await productManager.getProducts({ limit, page, sort, query });

    // Aseguramos estructura para el template
    const payload = Array.isArray(data) ? data : data.docs;
    const totalPages = Array.isArray(data) ? 1 : data.totalPages;
    const hasPrevPage = Array.isArray(data) ? false : data.hasPrevPage;
    const hasNextPage = Array.isArray(data) ? false : data.hasNextPage;
    const prevPage = Array.isArray(data) ? null : data.prevPage;
    const nextPage = Array.isArray(data) ? null : data.nextPage;

    // Construye links de paginación relativos
    function buildLink(pageNum) {
        const baseUrl = `${req.baseUrl}${req.path}`;
        const url = new URL(`http://x${baseUrl}`);
        for (const [k, v] of Object.entries(req.query)) {
            if (k !== 'page') url.searchParams.set(k, v);
        }
        url.searchParams.set('page', pageNum);
        return url.pathname + url.search;
    }

    res.render('products/index', {
        payload,
        page: Number(page) || 1,
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage ? buildLink(prevPage) : null,
        nextLink: hasNextPage ? buildLink(nextPage) : null,
        // por si quieres mostrar filtros/orden seleccionados en la vista:
        current: { limit, page, sort, query }
    });
});

module.exports = router;