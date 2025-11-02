# Smart Doorbell - Facial Recognition System

A modern, AI-powered smart doorbell system with real-time facial recognition capabilities built with React, TypeScript, and Lovable Cloud (Supabase).

## 🚀 Features

- **Live Camera Feed**: Real-time video streaming with facial detection overlay
- **AI Facial Recognition**: Powered by face-api.js for accurate face detection and recognition
- **Face Registration**: Easy-to-use interface for registering known faces
- **Real-time Alerts**: Instant notifications when someone is detected
- **Access Control**: Smart door unlock feature for recognized individuals
- **Activity Logs**: Complete history of all doorbell events with real-time updates
- **Secure Authentication**: User authentication and profile management
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** for beautiful, accessible UI components
- **face-api.js** for facial recognition
- **React Router** for navigation
- **TanStack Query** for data fetching

### Backend (Lovable Cloud / Supabase)
- **PostgreSQL** database for data persistence
- **Supabase Auth** for user authentication
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live activity updates
- **Edge Functions** (if needed for future enhancements)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A webcam for testing facial recognition
- Lovable Cloud account (automatically configured)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-doorbell
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Download Face-API.js Models

The facial recognition feature requires model files. Create a `public/models` directory and download the required models:

```bash
# Create the models directory
mkdir -p public/models
cd public/models

# Download the models (you can use wget or curl)
# Alternatively, download from: https://github.com/justadudewhohacks/face-api.js-models

# Required files:
# - tiny_face_detector_model-weights_manifest.json & shard1
# - face_landmark_68_model-weights_manifest.json & shard1
# - face_recognition_model-weights_manifest.json & shard1, shard2
# - ssd_mobilenetv1_model-weights_manifest.json & shard1, shard2
```

**Easy Method**: Clone the models directly:
```bash
cd public
git clone https://github.com/justadudewhohacks/face-api.js-models.git models
cd models
# Keep only the required files and remove the .git directory
rm -rf .git
```

### 4. Environment Setup

The environment variables are automatically configured by Lovable Cloud. The `.env` file is managed automatically and includes:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## ⚙️ Migration notes — JS configs & Tailwind precompiled

- This repository was converted from a TypeScript-config-based scaffold to use JavaScript configuration files. You'll find working JS configs in the project root:
   - `vite.config.js`
   - `tailwind.config.js`

- The original TypeScript config files and the original `.tsx` sources were archived, not deleted:
   - Archived configs: `archive_configs/`
   - Archived TSX sources: `archive_tsx/`

- Tailwind is precompiled into a static stylesheet to avoid needing Tailwind at build time. The generated CSS is available at:
   - `src/tailwind.generated.css` (imported by `src/index.css`)

- Developer dependencies for TypeScript and Tailwind's build pipeline were removed from `package.json` to make this a JavaScript-first project. This means:
   - `typescript` and `@types/*` packages were removed (no type checking in the repo by default).
   - `tailwindcss`, `postcss` (Tailwind plugin) and related build plugins were removed; `autoprefixer` is kept where needed.

If you want to restore TypeScript tooling or Tailwind build steps later, reinstall the appropriate dev dependencies and restore the archived configs from `archive_configs/`.


## 📖 Usage Guide

### First Time Setup

1. **Create an Account**
   - Navigate to the Auth page
   - Sign up with your email and password
   - The system automatically confirms emails for development

2. **Register Faces**
   - Go to the Dashboard
   - Click on "Register Faces" tab
   - Enter the person's name
   - Start the camera and position your face in the frame
   - Click "Register Face" to capture and save

3. **Live Monitoring**
   - Switch to "Live Camera" tab
   - Start the camera to begin facial detection
   - The system will automatically recognize registered faces
   - Use the "Unlock Door" button for recognized individuals

4. **View Activity**
   - Check the "Activity Logs" tab
   - See real-time updates of all doorbell events
   - Track recognized persons and unlock history

## 🏗️ Project Structure

```
smart-doorbell/
├── public/
│   ├── models/           # Face-API.js model files
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── CameraFeed.tsx
│   │   ├── FaceRegistration.tsx
│   │   └── LogsView.tsx
│   ├── integrations/
│   │   └── supabase/     # Auto-generated Supabase client
│   ├── pages/
│   │   ├── Index.tsx     # Landing page
│   │   ├── Auth.tsx      # Authentication
│   │   ├── Dashboard.tsx # Main dashboard
│   │   └── NotFound.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── App.tsx
│   ├── index.css         # Design system & Tailwind
│   └── main.tsx
└── README.md
```

## 🎨 Design System

The app uses a sophisticated dark theme with cyan/blue tech accents:

- **Primary Color**: Cyan (#4FD1C5) for main actions and highlights
- **Background**: Dark navy for a professional security feel
- **Cards**: Elevated with subtle gradients and shadows
- **Animations**: Smooth transitions with custom easing
- **Typography**: Clean, modern fonts with proper hierarchy

## 🔒 Security Features

- **Row Level Security (RLS)**: All database tables protected with RLS policies
- **User Isolation**: Users can only access their own data
- **Secure Authentication**: Supabase Auth with email/password
- **Input Validation**: All forms validated before submission
- **Face Data Encryption**: Face descriptors stored securely in database

## 🗄️ Database Schema

### Tables

**profiles**
- User profile information
- Linked to auth.users

**faces**
- Registered face data
- Face descriptors (JSONB)
- Associated images
- User ownership

**logs**
- Activity history
- Recognition events
- Unlock actions
- Timestamps

## 🚢 Deployment

The app is ready to deploy on Lovable:

1. Click the **Publish** button in Lovable
2. Your app will be deployed with a unique URL
3. Connect a custom domain (optional, requires paid plan)

## 🔧 Configuration

### Camera Settings

The app requests camera access with these settings:
- Resolution: 640x480 (optimal for face detection)
- Frame rate: Auto
- Audio: Disabled

### Face Recognition Parameters

- **Detection Model**: TinyFaceDetector (fast, efficient)
- **Recognition Threshold**: 0.6 (balanced accuracy)
- **Detection Interval**: 100ms (smooth real-time detection)

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note**: Camera access requires HTTPS in production. The app works on localhost without HTTPS.

## 🐛 Troubleshooting

### Models Not Loading
- Ensure model files are in `public/models/`
- Check browser console for 404 errors
- Verify file names match exactly

### Camera Not Working
- Check browser permissions
- Ensure HTTPS in production
- Try a different browser
- Check if another app is using the camera

### Face Recognition Not Accurate
- Ensure good lighting
- Register multiple angles of the same face
- Adjust recognition threshold in code if needed

### Database Errors
- Verify you're logged in
- Check internet connection
- Ensure RLS policies are active

## 🤝 Contributing

This is a demonstration project built with Lovable. Feel free to fork and customize for your needs.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for facial recognition
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Supabase](https://supabase.com/) for backend infrastructure
- [Lovable](https://lovable.dev/) for the development platform

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the code comments
- Open an issue in the repository

---

Built with ❤️ using Lovable