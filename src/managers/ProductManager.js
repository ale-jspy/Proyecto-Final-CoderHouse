// src/managers/ProductManager.js
const mongoose = require('mongoose');
const Product = require('../models/Product');

// helper: normaliza _id -> id (string) y oculta __v
const toClient = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(obj._id),
    title: obj.title,
    description: obj.description,
    code: obj.code,
    price: obj.price,
    category: obj.category,
    status: obj.status,
    stock: obj.stock,
    thumbnails: obj.thumbnails || [],
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

class ProductManager {
  constructor(_ignoredPath) {
  }


  // Si se llama sin args (como en los sockets), devuelve TODOS (limitado por defecto a 100)
  async getProducts(options = {}) {
    const { limit, page, sort, query } = options;

    // Soporta el "query" "key:value"
    const filter = {};
    if (query) {
      const [k, ...r] = String(query).split(':');
      const key = k?.trim(); const value = r.join(':').trim();
      if (key === 'category') filter.category = value;
      if (key === 'status') filter.status = value === 'true';
      if (key === 'available') filter.stock = value === 'true' ? { $gt: 0 } : { $lte: 0 };
    }

    const sortOpt = {};
    if (sort === 'asc') sortOpt.price = 1;
    if (sort === 'desc') sortOpt.price = -1;

    // Sin paginación explícita → lista “simple” (para websockets)
    if (!limit && !page) {
      const docs = await Product.find(filter).sort(sortOpt).limit(100).lean();
      return docs.map(d => toClient(d));
    }

    // Con paginación (para el endpoint GET /api/products)
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const [total, docs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortOpt)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
    ]);

    const totalPages = Math.max(Math.ceil(total / limitNum), 1);

    return {
      docs: docs.map(d => toClient(d)),
      total,
      page: pageNum,
      totalPages,
      hasPrevPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
      prevPage: pageNum > 1 ? pageNum - 1 : null,
      nextPage: pageNum < totalPages ? pageNum + 1 : null,
    };
  }

  async getProductById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await Product.findById(id);
    return toClient(doc);
  }

  async addProduct(product) {
    const data = {
      title: product.title,
      description: product.description ?? '',
      code: product.code, // <-- IMPORTANTE
      price: Number(product.price),
      category: product.category ?? null,
      status: product.status ?? true,
      stock: Number.isFinite(product.stock) ? Number(product.stock) : 0,
      thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : [],
    };
    if (!data.title || data.price == null || !data.code) {
      throw new Error('title, price y code son obligatorios');
    }
    const created = await Product.create(data);
    return toClient(created);
  }

  async updateProduct(id, updateFields) {
    if (!mongoose.isValidObjectId(id)) return null;

    // Para que no “cambien” el id
    const { id: _ignore, _id, __v, ...changes } = updateFields || {};

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: changes },
      { new: true, runValidators: true }
    );
    return toClient(updated);
  }

  async deleteProduct(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    const deleted = await Product.findByIdAndDelete(id);
    // Para compat con tu antigua función que devolvía true:
    return !!deleted;
  }
}

module.exports = ProductManager;