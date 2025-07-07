const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor(filePath) {
    this.filePath = path.resolve(filePath);
    }

    async _readFile() {
    const content = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(content);
    }

    async _writeFile(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

    async getProducts() {
    return await this._readFile();
    }

    async getProductById(id) {
    const products = await this._readFile();
    return products.find(p => p.id === id);
    }

    async addProduct(product) {
    const products = await this._readFile();
    const newId = products.length > 0 ? Number(products.at(-1).id) + 1 : 1;

    const newProduct = {
    id: newId.toString(),
    status: true,
    ...product
    };

    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
    }

    async updateProduct(id, updateFields) {
    const products = await this._readFile();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
    ...products[index],
    ...updateFields,
      id: products[index].id // asegurar que no cambie
    };

    await this._writeFile(products);
    return products[index];
    }

    async deleteProduct(id) {
    const products = await this._readFile();
    const filtered = products.filter(p => p.id !== id);
    await this._writeFile(filtered);
    return true;
    }
}

module.exports = ProductManager;