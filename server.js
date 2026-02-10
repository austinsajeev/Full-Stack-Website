require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs'); // Kept for initial seeding only

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Serve web.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web.html'));
});

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        seedProducts(); // Identify if we need to seed
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- SCHEMAS & MODELS ---
const ProductSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    desc: String,
    inStock: Boolean,
    image: String,
    variants: [{
        name: String,
        price: Number
    }]
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
    id: Number, // Using timestamp as ID for compatibility
    date: String,
    status: String,
    customer: Object,
    items: Array,
    total: Number,
    paymentMethod: String,
    eta: Number
});
const Order = mongoose.model('Order', OrderSchema);

const BulkOrderSchema = new mongoose.Schema({
    id: Number,
    date: String,
    company: String,
    contactPerson: String,
    phone: String,
    message: String
});
const BulkOrder = mongoose.model('BulkOrder', BulkOrderSchema);

const SubscriptionSchema = new mongoose.Schema({
    id: Number,
    date: String,
    name: String,
    phone: String,
    plan: String
});
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

// --- SEEDING HELPER ---
async function seedProducts() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const dataPath = path.join(__dirname, 'data', 'products.json');
            if (fs.existsSync(dataPath)) {
                const raw = fs.readFileSync(dataPath, 'utf8');
                const products = JSON.parse(raw);
                await Product.insertMany(products);
                console.log('Database seeded with initial products');
            }
        }
    } catch (e) {
        console.error('Seeding error:', e);
    }
}

// --- ENDPOINTS ---

// Get Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Product Stock
app.put('/api/products/:id/stock', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { inStock } = req.body;
        const product = await Product.findOneAndUpdate({ id }, { inStock }, { new: true });
        if (product) {
            res.json({ success: true, product });
        } else {
            res.status(404).json({ success: false, msg: 'Product not found' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Place Order
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        orderData.id = Date.now();
        orderData.date = new Date().toISOString();
        orderData.status = 'Pending';

        const newOrder = await Order.create(orderData);
        console.log('New Order:', newOrder.id);
        res.json({ success: true, orderId: newOrder.id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Order Status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id); // Our IDs are numbers
        const { status, eta } = req.body;
        const update = { status };
        if (eta) update.eta = eta;

        const order = await Order.findOneAndUpdate({ id }, update, { new: true });

        if (order) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, msg: 'Order not found' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Bulk Order Request
app.post('/api/bulk-orders', async (req, res) => {
    try {
        const data = req.body;
        data.id = Date.now();
        data.date = new Date().toISOString();
        await BulkOrder.create(data);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Bulk Orders
app.get('/api/bulk-orders', async (req, res) => {
    try {
        const items = await BulkOrder.find({});
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Subscribe
app.post('/api/subscribe', async (req, res) => {
    try {
        const data = req.body;
        data.id = Date.now();
        data.date = new Date().toISOString();
        await Subscription.create(data);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Subscriptions
app.get('/api/subscribe', async (req, res) => {
    try {
        const items = await Subscription.find({});
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delivery Check (Logic remains same)
const SHOP_COORDS = { lat: 13.0404, lon: 77.4978 };
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }

app.post('/api/delivery-check', async (req, res) => {
    const { location } = req.body;
    if (!location) return res.json({ serviceable: false, msg: 'No location' });

    try {
        let query = '';
        if (/^\d{6}$/.test(location.trim())) {
            query = location.trim() + ', India';
        } else {
            query = location + ', Karnataka, India';
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, { headers: { 'User-Agent': 'EdenFoods-DeliveryCheck/1.0' } });
        const data = await response.json();

        if (data && data.length > 0) {
            const dest = data[0];
            const dist = calculateDistance(SHOP_COORDS.lat, SHOP_COORDS.lon, parseFloat(dest.lat), parseFloat(dest.lon));
            const distKm = Math.round(dist);
            const isServiceable = distKm <= 50;
            const eta = 20 + Math.round(distKm * 2.5);

            res.json({
                serviceable: isServiceable,
                distanceKm: distKm,
                eta: isServiceable ? eta : null
            });
        } else {
            res.json({ serviceable: false, msg: 'Location not found. Try Pincode.', distanceKm: 0 });
        }
    } catch (e) {
        console.error('Geocoding error:', e);
        res.json({ serviceable: false, msg: 'Error checking location', distanceKm: 0 });
    }
});

// Login (Simple Auth)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'simple-admin-token-' + Date.now() });
    } else {
        res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
});

// --- SERVER START ---
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
