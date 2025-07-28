const { log } = require('console');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

const ProductManager = require('./managers/ProductManager');
const productManager = new ProductManager('./src/data/products.json'); 

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/carts', require('./routes/carts.routes'));

// Server
http.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Websockets
io.on('connection', (socket) => {
    console.log('Cliente conectado por WebSocket');

    socket.on('nuevoProducto', async (product) => {
    await productManager.addProduct(product);
    const update = await productManager.getProducts();
    io.emit('actualizarLista', update);
    });

    socket.on('eliminarProducto', async (id) => {
    await productManager.deleteProduct(id); 
    const update = await productManager.getProducts(); 
    io.emit('actualizarLista', update);
    });

    socket.on('disconnect', () => {
        console.log('Cliente Desconectado');
    });
});