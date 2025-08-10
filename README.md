# Proyecto Final - CoderHouse (Backend con MongoDB)

Este es el **Proyecto Final** del curso de Backend de CoderHouse.  
Implementa un servidor con **Node.js**, **Express** y **MongoDB Atlas** que gestiona productos y carritos de compras, con vistas en **Handlebars** y conexión en tiempo real con **Socket.io**.

---

## 📌 Tecnologías utilizadas

- **Node.js** (Entorno de ejecución)
- **Express.js** (Framework backend)
- **MongoDB Atlas** (Base de datos en la nube)
- **Mongoose** (ODM para MongoDB)
- **Handlebars** (Motor de plantillas para vistas)
- **Socket.io** (Actualización en tiempo real)
- **dotenv** (Manejo de variables de entorno)
- **Postman** (Pruebas de API)

---

## 📂 Estructura del proyecto

├── src
│ ├── routes # Rutas de API y vistas
│ ├── managers # Lógica de negocio (ProductManager, CartManager)
│ ├── models # Modelos de Mongoose (Product, Cart)
│ ├── views # Vistas Handlebars
│ ├── data # Archivos JSON de respaldo
│ ├── db.js # Conexión a MongoDB
│ └── app.js # Configuración principal del servidor
├── .env # Variables de entorno (conexión a MongoDB)
├── package.json # Dependencias y scripts
└── README.md # Documentación del proyecto

---

## ⚙️ Instalación y configuración

1️⃣ **Clonar el repositorio**

```bash
git clone git@github.com:ale-jspy/Proyecto-Final-CoderHouse.git
cd Proyecto-Final-CoderHouse

2️⃣ Instalar dependencias
npm install

3️⃣ Configurar variables de entorno
PORT=8080
MONGO_URI="TU_URI_DE_MONGODB_ATLAS"

4️⃣ Iniciar el servidor
node src/app.js

Envie las peticiones a:
http://localhost:8080


Autor(Alumno)
Alejandro Gutiérrez
Proyecto desarrollado para el curso Backend en CoderHouse.
```
