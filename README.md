# Eden Food Products - Full Stack Web Application

A comprehensive full-stack e-commerce solution designed for a local food business specializing in semi-cooked South Indian staples (Chapatti, Poori, Parotta). This project features a responsive customer-facing storefront and a powerful admin dashboard for business management.

## 🚀 Features

### 🛒 Customer Portal (Home Page - `web.html`)
*   **Modern UI/UX**: Built with **HTML5** and **Tailwind CSS** for a clean, responsive, and mobile-friendly design.
*   **Product Catalog**: Dynamic display of products with availability status (In Stock/Out of Stock).
*   **Shopping Cart**: Fully functional local-storage based cart with "Add to Cart", quantity adjustment, and floating summary.
*   **Checkout System**: Simulated checkout process offering Cash on Delivery (COD) and Online Payment options.
*   **Delivery Check API**: Integrated with **OpenStreetMap (Nominatim)** to calculate delivery feasibility and distance based on user location or pincode.
*   **Bulk & Subscriptions**: Dedicated forms for B2B inquiries and recurring family subscriptions.
*   **Testimonials & Recipes**: Sections to engage customers with social proof and usage ideas.

### 💼 Admin Dashboard (Admin Page - `admin.html`)
*   **Secure Access**: Simple authentication system to protect business data.
*   **Analytics Dashboard**: Visual charts (using **Chart.js**) for:
    *   Total & Daily Revenue
    *   Revenue Trends (Daily/Weekly/Monthly)
    *   Payment Method Mix
    *   Best Selling Products
    *   Top Loyal Customers
*   **Order Management**:
    *   View all orders with filtering (Pending/Received, Search by ID/Name).
    *   Update order status (e.g., mark as Received).
    *   **Invoice Generation**: Auto-generate and print professional invoices for any order.
*   **Stock Management**: Real-time toggle to update product availability (Stock In/Out) which instantly reflects on the customer site.
*   **Export Data**: Export order history to CSV for offline accounting.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS, Chart.js (for analytics).
*   **Backend**: Node.js, Express.js.
*   **Database**: JSON-based flat-file storage (Lightweight, no database server required).
    *   Data is stored in `data/products.json`, `data/orders.json`, etc.

## ⚙️ Installation & Run

1.  **Clone the repository**
    ```bash
    git clone https://github.com/austinsajeev/Full-Stack-Website.git
    cd Full-Stack-Website
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Server**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3000`.

## 🖥️ Usage

1.  **Open the Website**:
    Go to `http://localhost:3000/web.html` to view the customer store.

2.  **Access Admin Panel**:
    Go to `http://localhost:3000/admin.html`
    *   **Default Username**: `admin`
    *   **Default Password**: `admin123`

## 📂 Project Structure

*   `server.js`: Main backend logic and API endpoints.
*   `web.html`: Customer-facing frontend code.
*   `admin.html`: Admin dashboard frontend code.
*   `data/`: Contains JSON files acting as the database.
*   `images/`: Static assets for the website.

---
*Created by Austin Sajeev*
