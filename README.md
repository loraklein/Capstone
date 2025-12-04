# PastForward

A cross-platform application for digitizing handwritten documents using AI-powered OCR and text enhancement. Capture photos of handwritten pages, extract text automatically, and create professionally formatted PDFs ready for print-on-demand services.

**Live Demo:** [https://pastforward.ing](https://pastforward.ing)

## Features

### Document Digitization
- **Photo Capture**: High-quality document capture with camera or photo library upload
- **OCR Text Extraction**: Automatic text recognition from handwritten documents using Google Vision API
- **Line-by-Line Editing**: Manual text editing with side-by-side original image reference
- <u>**AI Text Enhancement**</u>: Intelligent correction of OCR errors, spelling, and grammar with project-type awareness (recipes, journals, letters)


### Organization & Management
- **Page Reordering**: Drag-and-drop interface for organizing pages
- **Image Rotation**: Correct page orientation for better readability
- <u>**Project Types**</u>: Specialized handling for recipes, journals, letters, and general documents
- <u>**Chapter Organization**</u>: Group pages into chapters/sections with custom titles

### Export & Publishing
- **Quick PDF Export**: Generate PDFs from extracted text
- **Text File Export**: Export all extracted text as a .txt file for easy editing or import into other applications
- **Create Printable Book**: Professional book formatting with:
  - Multiple book sizes (6x9, 8x11, 5.5x8.5)
  - Cover generation
  - <u>Customizable fonts and typography
  - Table of contents
  - Optional source image inclusion
- **Preview Before Export**</u>: View formatted output before generating PDF

### User Experience
- **Web & Mobile**: Responsive web app and native iOS/Android support via Expo
- **Light/Dark Mode**: Automatic theme adaptation based on system preferences
- **Offline Capable**: Works with local AI models (Ollama) in development
- <u>**Secure Authentication**</u>: User accounts with Supabase Auth

## Technology Stack

### Frontend
- **React Native** with **Expo** for cross-platform mobile and web deployment
- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **React Context** for state management

### Backend
- **Node.js** with **Express** API server
- **PostgreSQL** database via Supabase
- <u>**Supabase Storage**</u> for image hosting
- **Puppeteer** for PDF generation

### AI & OCR
- **Google Cloud Vision API** for OCR text extraction
- <u>**OpenAI GPT-4o-mini**</u> for text enhancement (production)
- **Ollama** for local AI models (development)
- Support for multiple providers: OpenAI, Ollama

## Deployment

- **Frontend**: <u>Netlify</u> with custom domain ([pastforward.ing](https://pastforward.ing))
- **Backend**: Render ([capstone-backend-og2c.onrender.com](https://capstone-backend-og2c.onrender.com))
- **Database & Storage**: Supabase

## Getting Started

### Prerequisites
- Node.js 20.x
- PostgreSQL (via Supabase)
- Google Cloud Vision API key
- OpenAI API key (for production) or Ollama (for local development)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/pastforward.git
cd pastforward

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Environment Setup

**Frontend** - Create `.env` in root:
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend** - Create `backend/.env`:
```
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_connection_string

# AI Services
GOOGLE_CLOUD_API_KEY=your_google_vision_key
OPENAI_API_KEY=your_openai_key
TEXT_ENHANCEMENT_PROVIDER=openai

# Server
PORT=3001
NODE_ENV=development
```

### Run Development Servers

```bash
# Frontend (web)
npm run web

# Frontend (iOS simulator)
npm run ios

# Frontend (Android emulator)
npm run android

# Backend
cd backend
npm run dev
```

## Architecture Highlights

- **Modular Service Layer**: Separate services for OCR, text enhancement, PDF generation, and storage
- **Provider Pattern**: Pluggable AI providers (OpenAI, Gemini, Ollama) with environment-based selection
- **Custom Hooks**: React hooks for camera, photo viewing, PDF generation, and project management
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Responsive Design**: Single codebase for web, iOS, and Android with platform-specific optimizations

## Key Dependencies

**Frontend:**
- `expo` - Cross-platform framework
- `expo-router` - File-based navigation
- `expo-camera` - Camera functionality
- `react-native-gesture-handler` - Drag-and-drop reordering

**Backend:**
- `express` - Web framework
- `@supabase/supabase-js` - Database and auth
- `@google-cloud/vision` - OCR
- `openai` - Text enhancement
- `puppeteer` - PDF generation

## License

This project was created as part of an Advanced Web Development capstone. Underlined text throughout represent extra features added beyond original project proposal or new technologies not previously used or experimented with before this capstone.
