# 🚀 Solaris Online Store - Glitch Deployment Guide

## Prerequisites
- Your project files ready
- Glitch account (free at glitch.com)

## Step-by-Step Deployment

### Method 1: Direct Upload to Glitch

1. **Prepare Your Project**
   ```bash
   # Build the React app
   cd client
   npm run build
   cd ..
   ```

2. **Go to Glitch**
   - Visit https://glitch.com
   - Sign up/Login (free account)

3. **Create New Project**
   - Click "New Project"
   - Choose "Import from GitHub" or "Upload files"

4. **Upload Files**
   - Upload all your project files
   - Make sure to include:
     - `package.json` (root)
     - `server/` folder
     - `client/build/` folder (after building)
     - `README.md`
     - `.glitchignore`

5. **Glitch Auto-Deploy**
   - Glitch will automatically detect Node.js
   - It will run `npm install` and `npm start`
   - Your app will be live at `https://your-project-name.glitch.me`

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/solaris-store.git
   git push -u origin main
   ```

2. **Import to Glitch**
   - Go to Glitch
   - "New Project" → "Import from GitHub"
   - Enter your GitHub repo URL
   - Glitch will clone and deploy automatically

## Important Files for Glitch

### Root `package.json`
```json
{
  "name": "solaris-online-store",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "sqlite3": "^5.1.6"
  }
}
```

### Server Configuration
- Your server is already configured to serve React build files
- Static files served from `client/build/`
- API routes work as expected

## Environment Variables (Optional)

In Glitch, you can set environment variables:
- `PORT` (automatically set by Glitch)
- `SECRET` (for JWT, currently using default)

## Testing Your Deployment

1. **Check API Endpoints**
   - `https://your-project.glitch.me/api/products`
   - `https://your-project.glitch.me/api/orders`

2. **Test Admin Login**
   - Username: `zahra00`
   - Password: `sol.pk`

3. **Test Order Placement**
   - Add items to cart
   - Complete checkout
   - Verify confirmation message

## Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Make sure to build React app first
   cd client
   npm run build
   ```

2. **Missing Dependencies**
   - Check that all dependencies are in root `package.json`
   - Glitch installs from root package.json

3. **Static Files Not Loading**
   - Ensure `client/build/` folder exists
   - Check server static file configuration

4. **Database Issues**
   - SQLite database will be created automatically
   - Admin user will be created on first run

## Features After Deployment

✅ **Live Website**: Your store will be accessible worldwide
✅ **Admin Panel**: Manage products and orders
✅ **Order System**: Customers can place orders
✅ **Responsive Design**: Works on all devices
✅ **Image Upload**: Admin can upload product images
✅ **Order Tracking**: View all customer orders

## Custom Domain (Optional)

Glitch allows custom domains:
1. Go to project settings
2. Add custom domain
3. Update DNS settings

## Support

- **Email**: zsafeer563@gmail.com
- **WhatsApp**: +9203320907957
- **Instagram**: @solaris_.pk

---

🎉 **Congratulations!** Your Solaris online store is now live on Glitch!
