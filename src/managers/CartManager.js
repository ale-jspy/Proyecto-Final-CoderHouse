const fs = require('fs').promises;
const path = require('path');

class CartManager {
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

    async createCart() {
    const carts = await this._readFile();
    const newId = carts.length > 0 ? Number(carts.at(-1).id) + 1 : 1;

    const newCart = {
        id: newId.toString(),
        products: []
    };

    carts.push(newCart);
    await this._writeFile(carts);
    return newCart;
    }

    async getCartById(id) {
        const carts = await this._readFile();
        return carts.find(c => c.id === id);
    }

    async addProductToCart(cid, pid) {
    const carts = await this._readFile();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product === pid);
    if (productIndex !== -1) {
        cart.products[productIndex].quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }

    await this._writeFile(carts);
    return cart;
    }
}

module.exports = CartManager;