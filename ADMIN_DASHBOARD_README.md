# Admin Dashboard Implementation

I have added a Shopify-like Admin Dashboard to your application allows you to manage products comfortably via the UI.

## 🚀 Features
- **Dashboard Overview**: See key stats (Products, Orders, Customers).
- **Product Management**: 
  - **List View**: See all products with images, prices, and stock status.
  - **Add Product**: Create new products with a user-friendly form.
  - **Edit Product**: Update existing product details.
  - **Delete Product**: Remove products with confirmation.
- **Secure Access**: Protected routes that only allow Admins to access.

## 🔑 How to Access

1. **Go to Admin Login**:
   - URL: `http://localhost:3000/admin/login`
   - Link: Hidden in the header until you login, or browse directly.

2. **Login Credentials**:
   - **Email**: `admin@perfumeshop.com`
   - **Password**: `admin123`

3. **Manage Products**:
   - Once logged in, click "Products" in the sidebar.
   - Click "Add Product" to create new perfume listings.

## 🛠️ Technical Details
- **Architecture**: React Frontend + Node/Express Backend.
- **Styling**: `src/admin/AdminStyles.css` (Custom CSS mimicking Shopify's "Polaris" design system).
- **Components**:
  - `AdminLayout`: Sidebar and main content wrapper.
  - `AdminProducts`: Product list table.
  - `AdminProductForm`: Add/Edit form.
  - `AdminDashboard`: Stats summary.

## 📝 Tips
- Images need to be URLs for now (e.g., from Unsplash or hosted online).
- Stock count determines if "In Stock" or "Out of Stock" badge is shown.
