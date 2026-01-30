const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Helper to read/write JSON
const DATA_DIR = path.join(__dirname, 'data');
const readJson = (file) => {
    try {
        const data = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};
const writeJson = (file, data) => {
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
};

// --- Endpoints ---

// Get Products
app.get('/api/products', (req, res) => {
    const products = readJson('products.json');
    res.json(products);
});

// Place Order
app.post('/api/orders', (req, res) => {
    const order = req.body;
    order.id = Date.now();
    order.date = new Date().toISOString();
    order.status = 'Pending';

    const orders = readJson('orders.json');
    orders.push(order);
    writeJson('orders.json', orders);

    console.log('New Order:', order);
    res.json({ success: true, orderId: order.id });
});
app.get('/api/orders', (req, res) => {
    const orders = readJson('orders.json');
    res.json(orders);
});

// Update Order Status
app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, eta } = req.body;

    const orders = readJson('orders.json');
    const orderIndex = orders.findIndex(o => o.id == id);

    if (orderIndex > -1) {
        orders[orderIndex].status = status;
        if (eta) orders[orderIndex].eta = eta; // Update ETA if provided
        writeJson('orders.json', orders);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, msg: 'Order not found' });
    }
});

// Bulk Order Request
app.post('/api/bulk-orders', (req, res) => {
    const request = req.body;
    request.id = Date.now();
    request.date = new Date().toISOString();

    const bulkOrders = readJson('bulk_orders.json');
    bulkOrders.push(request);
    writeJson('bulk_orders.json', bulkOrders);

    res.json({ success: true });
});

// Get Bulk Orders (for Admin)
app.get('/api/bulk-orders', (req, res) => {
    const bulkOrders = readJson('bulk_orders.json');
    res.json(bulkOrders);
});

// Subscribe
app.post('/api/subscribe', (req, res) => {
    const sub = req.body;
    sub.id = Date.now();
    sub.date = new Date().toISOString();

    const subscriptions = readJson('subscriptions.json');
    subscriptions.push(sub);
    writeJson('subscriptions.json', subscriptions);

    res.json({ success: true });
});

// Get Subscriptions (for Admin)
app.get('/api/subscribe', (req, res) => {
    const subscriptions = readJson('subscriptions.json');
    res.json(subscriptions);
});

// Delivery Check
// Shop Coordinates (HMT Layout, Bengaluru)
const SHOP_COORDS = { lat: 13.0404, lon: 77.4978 };

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

app.post('/api/delivery-check', async (req, res) => {
    const { location } = req.body;
    if (!location) return res.json({ serviceable: false, msg: 'No location' });

    try {
        let query = '';
        // Check if input is a 6-digit Pincode
        if (/^\d{6}$/.test(location.trim())) {
            query = location.trim() + ', India';
        } else {
            // Assume it's an area name in Karnataka
            query = location + ', Karnataka, India';
        }

        // Geocoding via Nominatim (OpenStreetMap)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

        console.log(`Checking Delivery for: ${query}`); // Debug log

        const response = await fetch(url, {
            headers: { 'User-Agent': 'EdenFoods-DeliveryCheck/1.0' }
        });
        const data = await response.json();

        if (data && data.length > 0) {
            const dest = data[0];
            const dist = calculateDistance(SHOP_COORDS.lat, SHOP_COORDS.lon, parseFloat(dest.lat), parseFloat(dest.lon));
            const distKm = Math.round(dist);

            // Limit: 50km
            const isServiceable = distKm <= 50;
            const eta = 20 + Math.round(distKm * 2.5);

            console.log(`Result: ${distKm}km, Serviceable: ${isServiceable}`);

            res.json({
                serviceable: isServiceable,
                distanceKm: distKm,
                eta: isServiceable ? eta : null
            });
        } else {
            console.log('Location not found in API');
            res.json({ serviceable: false, msg: 'Location not found. Try Pincode.', distanceKm: 0 });
        }
    } catch (e) {
        console.error('Geocoding error:', e);
        res.json({ serviceable: false, msg: 'Error checking location', distanceKm: 0 });
    }
});

// --- PRODUCTS & STOCK ---
app.get('/api/products', (req, res) => {
    const products = readJson('products.json');
    res.json(products || []);
});

app.put('/api/products/:id/stock', (req, res) => {
    const id = parseInt(req.params.id);
    const { inStock } = req.body;

    const products = readJson('products.json');
    const product = products.find(p => p.id === id);
    if (product) {
        product.inStock = inStock;
        writeJson('products.json', products);
        res.json({ success: true, product });
    } else {
        res.status(404).json({ success: false, msg: 'Product not found' });
    }
});

// Login (Simple Auth)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Simple hardcoded check
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'simple-admin-token-' + Date.now() });
    } else {
        res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
});

// --- SERVER START ---
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
