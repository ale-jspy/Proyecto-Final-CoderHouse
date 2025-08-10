// src/app.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();


const ProductManager = require('./managers/ProductManager');
const productManager = new ProductManager('./src/data/products.json'); // el path se ignora si ya migraste a Mongo internamente

// App / Server / WS
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Config
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API y vistas
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/carts', require('./routes/carts.routes'));
try {
    app.use('/', require('./routes/views.routes'));
} catch (_) {
    console.log('No se encontraron vistas, continua sin ellas');
}

// WebSockets
io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado por WebSocket');

    socket.on('nuevoProducto', async (product) => {
        try {
            await productManager.addProduct(product);
            const update = await productManager.getProducts();
            io.emit('actualizarLista', update);
        } catch (e) {
            console.error('WS nuevoProducto error:', e.message);
        }
    });

    socket.on('eliminarProducto', async (id) => {
        try {
            await productManager.deleteProduct(id);
            const update = await productManager.getProducts();
            io.emit('actualizarLista', update);
        } catch (e) {
            console.error('WS eliminarProducto error:', e.message);
        }
    });

    socket.on('disconnect', () => console.log('🔌 Cliente desconectado'));
});

// Bootstrap: Mongo + levantar server
(async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error('Falta MONGO_URI en .env');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Atlas conectado');
        server.listen(PORT, () =>
            console.log(` Server escuchando en http://localhost:${PORT}`)
        );
    } catch (err) {
        console.error('Error al iniciar la app:', err.message);
        process.exit(1);
    }
})();

// Cierre 
process.on('SIGINT', async () => {
    console.log('\nCerrando...');
    await mongoose.connection.close();
    server.close(() => process.exit(0));
});

module.exports = { app, io };