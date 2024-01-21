import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // Sirve los archivos estáticos de la carpeta 'public'

// Configura tus credenciales de autenticación aquí
const AUTH_HEADER = {
    'Authorization': `Bearer ${process.env.API_KEY}`
};

// Ruta para obtener productos
app.get('/api/items', async (req, res) => {
    try {
        const response = await fetch(`${process.env.API_URL}/items/`, { headers: AUTH_HEADER });
        if (!response.ok) throw new Error('Error al obtener productos');
        const products = await response.json();
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Ruta para obtener categorías
app.get('/api/categories', async (req, res) => {
    try {
        const response = await fetch(`${process.env.API_URL}/categories/`, { headers: AUTH_HEADER });
        if (!response.ok) throw new Error('Error al obtener categorías');
        const categories = await response.json();
        res.json(categories);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Ruta para obtener productos por categoría
app.get('/api/items/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const response = await fetch(`${process.env.API_URL}/items/category/${category}`, { headers: AUTH_HEADER });
        if (!response.ok) throw new Error(`Error al obtener productos de la categoría ${category}`);
        const products = await response.json();
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/cilindros', async (req, res) => {
    try {
        const response = await fetch(`${process.env.API_URL}/cilindros/`, { headers: AUTH_HEADER });
        if (!response.ok) throw new Error('Error al obtener cilindros');
        const cilindros = await response.json();
        res.json(cilindros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Ruta para crear una orden en Shopify
app.post('/api/create_shopify_order', async (req, res) => {
    try {
        const orderData = req.body;
        const response = await fetch(`${process.env.API_URL}/create_shopify_order/`, {
            method: 'POST',
            headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (!response.ok) throw new Error('Error al procesar el checkout');
        const result = await response.json();
        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
