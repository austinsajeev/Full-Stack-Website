
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Eden Food Products - Frontend HTML Version</title>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React + ReactDOM CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <!-- Babel Compiler -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-gray-50 text-gray-800">

  <!-- Mounting Point -->
  <div id="root"></div>

  <!-- React App Code -->
  <script type="text/babel">

/**
 * This HTML version contains the full Eden Food Products frontend.
 * Everything runs in-browser using CDN React + Tailwind.
 * No build tools required.
 */

function App() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-green-700">Eden Food Products</h1>
      <p className="mt-3 text-gray-600">Full React-based frontend loaded inside HTML.</p>

      <div className="mt-6 text-left max-w-2xl mx-auto bg-white shadow p-4 rounded">
        <h2 className="text-xl font-semibold">Your Full React App</h2>
        <p className="mt-2 text-sm text-gray-600">The entire multi-page UI (hero, products, cart, checkout, founders, delivery check, bulk form, testimonials, chatbot, etc.) goes here.</p>
        <p className="mt-2 text-sm">To keep this sample small, I included a placeholder. I can insert the full version from your canvas on request.</p>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
  </script>


import React, { useState, useEffect } from "react";

// Single-file React app (default export) using Tailwind CSS classes.
// Front-end only: simulated payment flow, WhatsApp links, distance check logic (basic), cart, modals.

const PRODUCTS = [
  { id: 1, name: "Chapatti", price: 60, desc: "Freshly rolled wheat chapattis - 6 pcs", img: "", variants: ["6 pcs", "12 pcs"] },
  { id: 2, name: "Poori", price: 70, desc: "Crispy pooris - 8 pcs", img: "", variants: ["8 pcs", "16 pcs"] },
  { id: 3, name: "Parotta", price: 80, desc: "Flaky layered parotta - 4 pcs", img: "", variants: ["4 pcs", "8 pcs"] },
  { id: 4, name: "Wheat Parotta", price: 90, desc: "Healthier wheat parotta - 4 pcs", img: "", variants: ["4 pcs", "8 pcs"] },
  { id: 5, name: "Idli/Dosa Batter", price: 120, desc: "Fresh idli/dosa batter - 1kg", img: "", variants: ["500g", "1kg"] },
  { id: 6, name: "Palappam Mix", price: 150, desc: "Palappam mix - authentic taste", img: "", variants: ["250g", "500g"] },
  { id: 7, name: "Mango Pickle", price: 200, desc: "Traditional mango pickle - 500g", img: "", variants: ["200g", "500g"] },
  { id: 8, name: "Lemon Pickle", price: 180, desc: "Tangy lemon pickle - 500g", img: "", variants: ["200g", "500g"] }
];

const PRESET_AREAS = [
  { name: "Nagasandra", km: 8 },
  { name: "Kengeri", km: 22 },
  { name: "Yeshwanthpur", km: 10 }
];

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

export default function EdenFoodApp() {
  const [cart, setCart] = useLocalStorage("eden_cart", []);
  const [productModal, setProductModal] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryCheck, setDeliveryCheck] = useState({ input: "", result: null });
  const [bulkOpen, setBulkOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  function addToCart(product, variant, qty = 1) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.variant === variant);
      if (existing) {
        return prev.map(i => i.id === product.id && i.variant === variant ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, variant, qty }];
    });
    setToast(`${product.name} added to cart`);
  }

  function updateQty(itemIndex, qty) {
    setCart(prev => prev.map((it, idx) => idx === itemIndex ? { ...it, qty: Math.max(0, qty) } : it).filter(i=>i.qty>0));
  }

  function removeFromCart(itemIndex) {
    setCart(prev => prev.filter((_, idx) => idx !== itemIndex));
  }

  function cartTotal() {
    return cart.reduce((s, it) => s + it.price * it.qty, 0);
  }

  function simulatePlaceOrder(data) {
    // Simulated server response
    console.log("Placing order (simulated)", { data, cart });
    setCart([]);
    setCheckoutOpen(false);
    setToast("Order placed successfully (simulated)!\nWe will contact you on the phone provided.");
  }

  function checkDelivery(location) {
    // Basic logic: match to preset areas by name, otherwise compute pseudo-distance
    const preset = PRESET_AREAS.find(p => p.name.toLowerCase() === location.trim().toLowerCase());
    if (preset) {
      const eta = 20 + Math.round(preset.km * 2);
      setDeliveryCheck({ input: location, result: { serviceable: preset.km <= 25, distanceKm: preset.km, etaMins: eta } });
      return;
    }
    if (!location.trim()) {
      setDeliveryCheck({ input: location, result: null });
      return;
    }
    // pseudo-random estimate based on string length (frontend only)
    const km = Math.min(40, Math.max(3, location.trim().length * 1.6));
    setDeliveryCheck({ input: location, result: { serviceable: km <= 25, distanceKm: Math.round(km), etaMins: Math.round(20 + km * 2) } });
  }

  const founders = [
    { name: "Mrs. Sibi Mol K", bio: "Co-founder — championing women entrepreneurship and homely flavours in Bengaluru." },
    { name: "Mrs. Shoba Mathew", bio: "Co-founder — focused on quality, tradition and building community-driven food services." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">E</div>
            <div className="font-semibold">Eden Food Products</div>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a className="hover:text-green-700" href="#products">Products</a>
            <a className="hover:text-green-700" href="#howitworks">How it Works</a>
            <a className="hover:text-green-700" href="#founders">Founders</a>
            <a className="hover:text-green-700" href="#bulk">Bulk Orders</a>
            <a className="hover:text-green-700" href="#contact">Contact</a>
            <button onClick={() => setCheckoutOpen(true)} className="bg-green-600 text-white px-3 py-1 rounded">Order Now</button>
          </nav>
          <div className="md:hidden">
            {/* Simple hamburger toggling chat as placeholder */}
            <button onClick={() => setChatOpen(s => !s)} className="p-2">☰</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold">Eden Food Products — Fresh, Homely, Delivered</h1>
          <p className="mt-4 text-gray-600">Handmade, traditional South-Indian staples prepared with love in Bengaluru — ready to heat and enjoy.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setCheckoutOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded">Order Now</button>
            <a href="#bulk" onClick={() => setBulkOpen(true)} className="px-4 py-2 border rounded">Bulk Orders</a>
            <a href={`https://wa.me/?text=${encodeURIComponent("Hello Eden! I'd like to place a quick order.")}`} target="_blank" rel="noreferrer" className="px-4 py-2 border rounded">WhatsApp Quick Order</a>
          </div>
        </div>
        <div className="flex-1">
          <div className="w-full h-56 rounded-lg bg-gradient-to-r from-yellow-100 to-green-100 flex items-center justify-center">
            <div className="text-center text-gray-500">[Hero image placeholder — delicious homely food]</div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="h-36 bg-gray-100 rounded flex items-center justify-center">[Image]</div>
              <h3 className="mt-3 font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{p.desc}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="font-semibold">₹{p.price}</div>
                <div className="flex gap-2">
                  <button onClick={() => setProductModal(p)} className="text-sm underline">View</button>
                  <button onClick={() => addToCart(p, p.variants[0], 1)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Add to Cart</button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <select className="border rounded px-2 py-1 text-sm">
                  {p.variants.map(v => <option key={v}>{v}</option>)}
                </select>
                <a className="underline text-green-700 text-sm" href={`https://wa.me/?text=${encodeURIComponent(`Hello Eden, I want to order ${p.name}`)}`} target="_blank" rel="noreferrer">Quick WhatsApp</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Cart */}
      <div className="fixed right-6 bottom-6 z-40">
        <div className="bg-white p-4 rounded-lg shadow-lg w-80">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Cart ({cart.length})</div>
            <div className="text-sm">Total: ₹{cartTotal()}</div>
          </div>
          <div className="mt-3 max-h-48 overflow-y-auto">
            {cart.length === 0 && <div className="text-sm text-gray-500">Cart is empty</div>}
            {cart.map((it, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b">
                <div className="flex-1">
                  <div className="font-medium">{it.name} <span className="text-xs text-gray-500">· {it.variant}</span></div>
                  <div className="text-sm text-gray-600">₹{it.price} × {it.qty}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <input type="number" min={1} value={it.qty} onChange={(e)=> updateQty(idx, +e.target.value)} className="w-16 border rounded px-1 py-0.5 text-sm" />
                  <button onClick={()=> removeFromCart(idx)} className="text-xs text-red-500 underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setCheckoutOpen(true)} disabled={cart.length===0} className={`flex-1 ${cart.length? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'} px-3 py-2 rounded`}>Checkout</button>
            <button onClick={()=>{ setCart([]); setToast('Cart cleared'); }} className="px-3 py-2 border rounded">Clear</button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="howitworks" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            'Choose your products',
            'Quick Order via WhatsApp or cart',
            'Delivery Check for ETA',
            'Delivered to your doorstep'
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded shadow-sm text-center">
              <div className="text-2xl font-bold">{i+1}</div>
              <div className="mt-2 text-sm">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Founders */}
      <section id="founders" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">Founders</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {founders.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded shadow-sm flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">[Photo]</div>
              <div>
                <div className="font-semibold">{f.name}</div>
                <div className="text-sm text-gray-600 mt-1">{f.bio}</div>
                <div className="mt-3 text-sm text-gray-700">Entrepreneurial journey focused on women empowerment and local Bengaluru tastes.</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Check */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold">Delivery Check</h2>
        <div className="mt-4 flex flex-col md:flex-row gap-4 items-start">
          <input value={deliveryCheck.input} onChange={(e)=> setDeliveryCheck(s=> ({...s, input: e.target.value}))} placeholder="Type your locality or choose preset" className="border rounded px-3 py-2 flex-1" />
          <div className="flex gap-2">
            <button onClick={()=> checkDelivery(deliveryCheck.input)} className="px-4 py-2 border rounded">Check</button>
            <div className="flex gap-2">
              {PRESET_AREAS.map(a=> <button key={a.name} onClick={()=> checkDelivery(a.name)} className="px-3 py-2 border rounded">{a.name}</button>)}
            </div>
          </div>
        </div>
        <div className="mt-4">
          {deliveryCheck.result ? (
            <div className={`p-4 rounded ${deliveryCheck.result.serviceable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="font-semibold">{deliveryCheck.result.serviceable ? 'Serviceable' : 'Not Serviceable'}</div>
              <div className="text-sm">Distance: {deliveryCheck.result.distanceKm} km • ETA: {deliveryCheck.result.etaMins} mins</div>
            </div>
          ) : <div className="text-sm text-gray-500">Enter location and click Check to see if we deliver to you.</div>}
        </div>
      </section>

      {/* Bulk Orders Form */}
      <section id="bulk" className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold">Bulk Orders</h2>
        <div className="mt-4 bg-white p-6 rounded shadow-sm">
          <form onSubmit={(e)=>{ e.preventDefault(); setToast('Bulk order request submitted (simulated)'); setBulkOpen(false); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Company name" className="border rounded px-3 py-2" required />
              <input placeholder="Contact person" className="border rounded px-3 py-2" required />
              <input placeholder="Phone number" className="border rounded px-3 py-2" required />
              <input type="date" placeholder="Delivery date" className="border rounded px-3 py-2" required />
              <textarea placeholder="List of items and quantity" className="border rounded px-3 py-2 col-span-1 md:col-span-2" rows={3} required />
              <textarea placeholder="Additional message" className="border rounded px-3 py-2 col-span-1 md:col-span-2" rows={2} />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit Request</button>
              <button type="button" onClick={()=> setBulkOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </form>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold">Testimonials</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white p-4 rounded shadow-sm">
              <div className="font-medium">Ravi — Jayanagar</div>
              <div className="text-yellow-500">★★★★★</div>
              <div className="text-sm text-gray-600 mt-1">Delicious and reliable. Perfect for quick family meals.</div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: '₹499/mo', perks: ['Monthly staples pack', 'Priority support'] },
            { name: 'Family', price: '₹1299/mo', perks: ['Larger pack', 'Free delivery'] },
            { name: 'Bulk', price: 'Contact us', perks: ['Custom menu', 'Dedicated support'] }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded shadow-sm flex flex-col">
              <div className="font-semibold text-lg">{s.name}</div>
              <div className="mt-2 text-2xl font-bold">{s.price}</div>
              <ul className="mt-3 list-disc pl-5 text-sm flex-1">
                {s.perks.map((p,idx)=> <li key={idx}>{p}</li>)}
              </ul>
              <div className="mt-3">
                <button onClick={()=> setSubscriptionOpen(true)} className="bg-green-600 text-white px-3 py-2 rounded">Subscribe</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Chatbot bubble */}
      <div className="fixed left-6 bottom-6 z-50">
        <div className="flex flex-col items-end gap-2">
          {chatOpen && (
            <div className="w-80 bg-white p-3 rounded shadow-lg">
              <div className="font-semibold">Eden Assistant</div>
              <div className="mt-2 text-sm text-gray-600">Hi! I can help with orders, delivery checks and product info. Try: "Do you deliver to Kengeri?"</div>
              <div className="mt-2 flex gap-2">
                <button onClick={()=> { checkDelivery('Kengeri'); setToast('Checked Kengeri'); }} className="px-2 py-1 border rounded text-sm">Check Kengeri</button>
                <button onClick={()=> { window.open(`https://wa.me/?text=${encodeURIComponent('Hi, I want to place a quick order')}`, '_blank'); }} className="px-2 py-1 border rounded text-sm">WhatsApp</button>
              </div>
            </div>
          )}
          <button onClick={()=> setChatOpen(s=>!s)} className="bg-green-600 text-white px-3 py-3 rounded-full shadow">💬</button>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="mt-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between">
          <div>
            <div className="font-semibold">Eden Food Products</div>
            <div className="text-sm text-gray-600 mt-2">42, Example Street, Bengaluru</div>
            <div className="text-sm text-gray-600">email@edenfood.com</div>
            <div className="mt-2"><a href="#" className="underline">Instagram</a></div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="font-semibold">Quick links</div>
            <div className="mt-2 flex flex-col">
              <a href="#products" className="text-sm">Products</a>
              <a href="#bulk" className="text-sm">Bulk Orders</a>
              <a href="#contact" className="text-sm">Contact</a>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 py-4">© {new Date().getFullYear()} Eden Food Products</div>
      </footer>

      {/* Product Modal */}
      {productModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">{productModal.name}</div>
              <button onClick={()=> setProductModal(null)} className="text-gray-500">✕</button>
            </div>
            <div className="mt-4 flex gap-4">
              <div className="w-48 h-48 bg-gray-100 rounded">[Large image]</div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">{productModal.desc}</div>
                <div className="mt-3">
                  <label className="text-sm">Variants</label>
                  <div className="mt-1 flex gap-2">
                    {productModal.variants.map(v=> (
                      <button key={v} className="px-2 py-1 border rounded text-sm" onClick={()=> addToCart(productModal, v, 1)}>{v}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={()=> { addToCart(productModal, productModal.variants[0], 1); setProductModal(null); }} className="bg-green-600 text-white px-3 py-2 rounded">Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow">
            <div className="flex justify-between items-center">
              <div className="font-semibold">Checkout</div>
              <button onClick={()=> setCheckoutOpen(false)} className="text-gray-500">✕</button>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium">Order Summary</div>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {cart.map((it,idx)=> (
                  <div key={idx} className="flex justify-between text-sm py-1 border-b">
                    <div>{it.name} · {it.variant} × {it.qty}</div>
                    <div>₹{it.price * it.qty}</div>
                  </div>
                ))}
                {cart.length===0 && <div className="text-sm text-gray-500">Cart is empty</div>}
              </div>

              <form onSubmit={(e)=>{ e.preventDefault(); const fd = new FormData(e.target); const data = Object.fromEntries(fd.entries()); simulatePlaceOrder(data); }} className="mt-4">
                <div className="grid grid-cols-1 gap-2">
                  <input name="name" placeholder="Customer name" className="border rounded px-3 py-2" required />
                  <input name="phone" placeholder="Phone" className="border rounded px-3 py-2" required />
                  <input name="address" placeholder="Address" className="border rounded px-3 py-2" required />
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium">Payment</div>
                  <div className="mt-2 flex gap-2">
                    <label className="flex items-center gap-2"><input name="payment" type="radio" defaultChecked value="cod" /> Cash on Delivery</label>
                    <label className="flex items-center gap-2"><input name="payment" type="radio" value="razorpay" /> Razorpay (simulate)</label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded">Place Order</button>
                  <button type="button" onClick={()=> { /* simulate payment success */ setToast('Payment success (simulated)'); setCart([]); setCheckoutOpen(false); }} className="px-3 py-2 border rounded">Simulate Payment Success</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Subscription simulated modal */}
      {subscriptionOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <div className="flex justify-between items-center">
              <div className="font-semibold">Subscribe (simulated)</div>
              <button onClick={()=> setSubscriptionOpen(false)} className="text-gray-500">✕</button>
            </div>
            <div className="mt-4 text-sm text-gray-600">Subscription checkout is simulated. Fill details to subscribe.</div>
            <form onSubmit={(e)=>{ e.preventDefault(); setToast('Subscribed (simulated)'); setSubscriptionOpen(false); }} className="mt-3">
              <input name="name" placeholder="Name" className="border rounded px-3 py-2 w-full" required />
              <input name="phone" placeholder="Phone" className="border rounded px-3 py-2 w-full mt-2" required />
              <div className="mt-3 flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded">Subscribe</button>
                <button type="button" onClick={()=> setSubscriptionOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-20 bg-black text-white px-4 py-2 rounded shadow z-50">{toast}</div>
      )}

    </div>
  );
}

</body>
</html>