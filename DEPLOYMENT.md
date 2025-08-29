# Quick Deployment Guide

## 🚀 Get Your Website Running in 5 Minutes

### Option 1: Local Development (Easiest)
1. **Install Live Server in VS Code**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Install and restart VS Code

2. **Open the Website**
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - Your website will open in your browser!

### Option 2: Python (Built-in)
1. **Open Terminal/Command Prompt**
2. **Navigate to the website folder**
3. **Run one of these commands:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
4. **Open your browser and go to:** `http://localhost:8000`

### Option 3: Node.js
1. **Install Node.js** from [nodejs.org](https://nodejs.org/)
2. **Install a simple server:**
   ```bash
   npm install -g http-server
   ```
3. **Navigate to the website folder and run:**
   ```bash
   http-server
   ```
4. **Open your browser and go to:** `http://localhost:8080`

## ⚠️ Important: Configure Firebase First!

Before your website will work, you need to:

1. **Update `firebase-config.js`** with your actual Firebase project details
2. **Enable Google Authentication** in your Firebase project
3. **Set up Firestore Database** with proper security rules

See the main README.md for detailed Firebase setup instructions.

## 🌐 Production Deployment

### Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select source branch
4. Your site will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag and drop your website folder to [netlify.com](https://netlify.com)
2. Your site will be live instantly!

## 🔧 Troubleshooting

- **Website loads but doesn't work?** Check Firebase configuration
- **Authentication fails?** Verify Google Auth is enabled in Firebase
- **Data not syncing?** Check Firestore security rules
- **Console errors?** Open browser dev tools (F12) and check the Console tab

## 📱 Test Your Website

1. **Sign In** with your Google account
2. **Add a class** to test the system
3. **Add homework** and associate it with the class
4. **Check real-time sync** by opening in another tab

---

**Need help? Check the main README.md for detailed setup instructions!**
