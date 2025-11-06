# AI-Powered Precision Farming Decision Support System

A modern web application that leverages AI and machine learning to help farmers make data-driven decisions about crop selection, fertilizer usage, and yield prediction. Built with React, TypeScript, and Supabase.

## Features

- 🌾 **Crop Prediction**: Get AI-powered recommendations for the best crops to grow based on soil conditions
- 🌱 **Fertilizer Recommendations**: Receive personalized fertilizer suggestions for optimal crop growth
- 📊 **Yield Prediction**: Forecast crop yields based on historical data and current conditions
- 📝 **Soil Data Management**: Input and manage soil parameters including nitrogen, phosphorus, potassium, pH, rainfall, and temperature
- 📈 **Prediction History**: View and track all your past predictions and recommendations
- 🔐 **User Authentication**: Secure user accounts with Supabase authentication
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Edge Functions)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the migration file located in `supabase/migrations/` to set up your database schema
   - Deploy the Edge Functions in `supabase/functions/`

4. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Build for Production

Create a production build:
```bash
npm run build
```

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── AuthForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── PredictionHistory.tsx
│   │   ├── RecommendationDashboard.tsx
│   │   └── SoilDataForm.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                 # Utility libraries
│   │   └── supabase.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── supabase/
│   ├── functions/           # Supabase Edge Functions
│   │   ├── predict-crop/
│   │   ├── predict-fertilizer/
│   │   └── predict-yield/
│   └── migrations/          # Database migrations
├── index.html
├── package.json
└── vite.config.ts
```

## Usage

1. **Sign Up/Login**: Create an account or sign in to access the dashboard
2. **Input Soil Data**: Navigate to the Home tab and enter your soil parameters:
   - Nitrogen (N) levels
   - Phosphorus (P) levels
   - Potassium (K) levels
   - pH value
   - Rainfall
   - Temperature
3. **Get Recommendations**: Submit the form to receive AI-powered recommendations for:
   - Best crop to grow
   - Recommended fertilizer
   - Predicted yield
4. **View History**: Check the History tab to review all your past predictions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.


