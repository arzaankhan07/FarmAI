/*
  # Precision Farming Decision Support System Schema

  ## Overview
  This migration creates the complete database schema for the AI-powered farming decision support system.

  ## New Tables

  ### 1. `user_profiles`
  Extended user profile information for farmers
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - Farmer's full name
  - `region` (text) - Geographic region
  - `preferred_language` (text) - Language preference (en, hi, ta, etc.)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `soil_data`
  Stores soil test data and environmental conditions
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to user_profiles
  - `nitrogen` (decimal) - N content in soil
  - `phosphorus` (decimal) - P content in soil
  - `potassium` (decimal) - K content in soil
  - `ph_level` (decimal) - Soil pH value
  - `temperature` (decimal) - Temperature in Celsius
  - `humidity` (decimal) - Humidity percentage
  - `rainfall` (decimal) - Rainfall in mm
  - `location` (text) - Farm location
  - `created_at` (timestamptz) - Data entry timestamp

  ### 3. `crop_recommendations`
  Stores AI-generated crop recommendations
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `soil_data_id` (uuid, foreign key)
  - `recommended_crop` (text) - AI recommended crop
  - `confidence_score` (decimal) - Model confidence (0-1)
  - `alternate_crops` (jsonb) - Alternative crop suggestions
  - `reasoning` (text) - Explanation for recommendation
  - `created_at` (timestamptz)

  ### 4. `fertilizer_recommendations`
  Stores fertilizer recommendations
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `soil_data_id` (uuid, foreign key)
  - `crop_type` (text) - Target crop
  - `fertilizer_type` (text) - Recommended fertilizer
  - `dosage` (text) - Application dosage
  - `timing` (text) - Application timing
  - `created_at` (timestamptz)

  ### 5. `yield_predictions`
  Stores crop yield predictions
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `soil_data_id` (uuid, foreign key)
  - `crop_type` (text) - Crop being predicted
  - `predicted_yield` (decimal) - Predicted yield in tons/hectare
  - `confidence_interval` (jsonb) - Upper and lower bounds
  - `factors` (jsonb) - Key influencing factors
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated access required for all operations
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  region text,
  preferred_language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create soil_data table
CREATE TABLE IF NOT EXISTS soil_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  nitrogen decimal(5,2) NOT NULL,
  phosphorus decimal(5,2) NOT NULL,
  potassium decimal(5,2) NOT NULL,
  ph_level decimal(4,2) NOT NULL,
  temperature decimal(5,2) NOT NULL,
  humidity decimal(5,2) NOT NULL,
  rainfall decimal(7,2) NOT NULL,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create crop_recommendations table
CREATE TABLE IF NOT EXISTS crop_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  soil_data_id uuid NOT NULL REFERENCES soil_data(id) ON DELETE CASCADE,
  recommended_crop text NOT NULL,
  confidence_score decimal(4,3),
  alternate_crops jsonb DEFAULT '[]'::jsonb,
  reasoning text,
  created_at timestamptz DEFAULT now()
);

-- Create fertilizer_recommendations table
CREATE TABLE IF NOT EXISTS fertilizer_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  soil_data_id uuid NOT NULL REFERENCES soil_data(id) ON DELETE CASCADE,
  crop_type text NOT NULL,
  fertilizer_type text NOT NULL,
  dosage text,
  timing text,
  created_at timestamptz DEFAULT now()
);

-- Create yield_predictions table
CREATE TABLE IF NOT EXISTS yield_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  soil_data_id uuid NOT NULL REFERENCES soil_data(id) ON DELETE CASCADE,
  crop_type text NOT NULL,
  predicted_yield decimal(8,2) NOT NULL,
  confidence_interval jsonb,
  factors jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE yield_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for soil_data
CREATE POLICY "Users can view own soil data"
  ON soil_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own soil data"
  ON soil_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own soil data"
  ON soil_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own soil data"
  ON soil_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for crop_recommendations
CREATE POLICY "Users can view own crop recommendations"
  ON crop_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crop recommendations"
  ON crop_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for fertilizer_recommendations
CREATE POLICY "Users can view own fertilizer recommendations"
  ON fertilizer_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fertilizer recommendations"
  ON fertilizer_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for yield_predictions
CREATE POLICY "Users can view own yield predictions"
  ON yield_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own yield predictions"
  ON yield_predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_soil_data_user_id ON soil_data(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user_id ON crop_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_recommendations_user_id ON fertilizer_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_user_id ON yield_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_data_created_at ON soil_data(created_at DESC);
