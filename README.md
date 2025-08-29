# TaskMate Website

A modern, desktop-optimized web application for managing classes and homework assignments. Built with Firebase for real-time synchronization and Google authentication.

## 🚀 Features

### Core Functionality
- **Google Authentication** - Sign in with your Google account
- **Real-time Sync** - Changes sync instantly between devices
- **Offline Support** - Works offline and syncs when connection is restored
- **Cross-platform** - Access from any device with a web browser

### Class Management
- Add/edit classes with detailed information
- Set class schedules (days and times)
- Custom color coding for visual organization
- Location and professor details

### Homework Management
- Create homework assignments with due dates
- Priority levels (Low, Medium, High)
- Status tracking (Pending, In Progress, Completed)
- Class association
- Rich descriptions and metadata

### Dashboard
- Overview of upcoming deadlines
- Recent class information
- Quick actions for adding new items
- Real-time updates

## 🛠️ Setup Instructions

### Prerequisites
- A Firebase project with Firestore Database enabled
- Google Authentication enabled in Firebase
- Basic knowledge of web development

### Step 1: Firebase Project Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or select an existing project
   - Follow the setup wizard

2. **Enable Firestore Database**
   - In your Firebase project, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location close to your users

3. **Enable Google Authentication**
   - Go to "Authentication" → "Sign-in method"
   - Enable "Google" provider
   - Add your domain to authorized domains (for production)

4. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Add app" → "Web"
   - Copy the configuration object

### Step 2: Configure the Website

1. **Update Firebase Configuration**
   - Open `firebase-config.js`
   - Replace the placeholder values with your actual Firebase config

2. **Set Firestore Security Rules**
   - In Firebase Console, go to "Firestore Database" → "Rules"
   - Replace the default rules with proper user isolation rules

### Step 3: Deploy the Website

#### Option A: Local Development
1. Install Live Server in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option B: Firebase Hosting (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize hosting: `firebase init hosting`
4. Deploy: `firebase deploy`

## 📱 Usage

### Getting Started
1. Open the website in your browser
2. Click "Sign In" and authenticate with your Google account
3. Start by adding your classes
4. Add homework assignments and associate them with classes

### Navigation
- **Dashboard**: Overview of your academic life
- **Classes**: Manage your class schedule
- **Homework**: Track assignments and deadlines

## 🔄 Sync with iOS App

The website uses the same Firebase project as your iOS app, ensuring:
- **Unified Data**: Same classes and homework across platforms
- **Real-time Updates**: Changes on one device appear instantly on others
- **Same Account**: Use the same Google account on both platforms

## 🚨 Troubleshooting

### Common Issues
1. **Authentication Fails** - Check if Google Auth is enabled in Firebase
2. **Data Not Syncing** - Verify Firestore rules allow read/write
3. **Offline Not Working** - Ensure Firestore persistence is enabled

### Debug Mode
- Open browser developer tools (F12)
- Check Console tab for error messages

---

**Happy organizing! 📚✨**
