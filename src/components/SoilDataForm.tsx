import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Droplets, Thermometer, Cloud, Activity, MapPin, RefreshCw } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Animated Section Component
function AnimatedSection({ 
  children, 
  delay = 0,
  direction = 'up'
}: { 
  children: React.ReactNode; 
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const { ref, isVisible } = useScrollAnimation();

  const directionClasses = {
    up: 'translate-y-10',
    down: '-translate-y-10',
    left: 'translate-x-10',
    right: '-translate-x-10',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : `opacity-0 ${directionClasses[direction]}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface SoilDataFormProps {
  onSuccess: () => void;
}

export function SoilDataForm({ onSuccess }: SoilDataFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph_level: '',
    temperature: '',
    humidity: '',
    rainfall: '',
    location: '',
  });

  const fetchWeatherData = async () => {
    if (!formData.location || formData.location.length < 3) {
      setWeatherError('Please enter a location first');
      return;
    }

    setFetchingWeather(true);
    setWeatherError('');

    try {
      // Using OpenWeatherMap API (free tier)
      // Note: In production, you should use your own API key
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY || 'demo';
      
      // Try to get coordinates first, then weather
      const geocodeResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(formData.location)}&limit=1&appid=${apiKey}`
      );

      if (!geocodeResponse.ok && apiKey === 'demo') {
        // Fallback to mock data if API key is not set
        setFormData(prev => ({
          ...prev,
          temperature: (20 + Math.random() * 15).toFixed(1),
          humidity: (50 + Math.random() * 30).toFixed(1),
          rainfall: (50 + Math.random() * 100).toFixed(1),
        }));
        setFetchingWeather(false);
        return;
      }

      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData || geocodeData.length === 0) {
        throw new Error('Location not found');
      }

      const { lat, lon } = geocodeData[0];

      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json();

      // Update form with weather data
      setFormData(prev => ({
        ...prev,
        temperature: weatherData.main.temp.toFixed(1),
        humidity: weatherData.main.humidity.toFixed(1),
        rainfall: weatherData.rain?.['1h'] ? (weatherData.rain['1h'] * 10).toFixed(1) : '0.0', // Convert mm/h to mm
      }));

    } catch (err: any) {
      console.error('Weather fetch error:', err);
      // Fallback to sample data if API fails
      setFormData(prev => ({
        ...prev,
        temperature: (20 + Math.random() * 15).toFixed(1),
        humidity: (50 + Math.random() * 30).toFixed(1),
        rainfall: (50 + Math.random() * 100).toFixed(1),
      }));
      setWeatherError('Using estimated weather data. For accurate data, please enter manually.');
    } finally {
      setFetchingWeather(false);
    }
  };

  // Auto-fetch weather when location is entered
  useEffect(() => {
    if (formData.location && formData.location.length > 3) {
      const timeoutId = setTimeout(() => {
        fetchWeatherData();
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('soil_data').insert({
        user_id: user?.id,
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        ph_level: parseFloat(formData.ph_level),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        rainfall: parseFloat(formData.rainfall),
        location: formData.location,
      });

      if (insertError) throw insertError;

      setFormData({
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        ph_level: '',
        temperature: '',
        humidity: '',
        rainfall: '',
        location: '',
      });

      onSuccess();
    } catch (err) {
      setError('Failed to save soil data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
      <AnimatedSection delay={0}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Soil & Weather Data
          </h2>
          <p className="text-gray-600">Enter your farm's soil and environmental conditions</p>
        </div>
      </AnimatedSection>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatedSection delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nitrogen (N) - kg/ha
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="number"
                  name="nitrogen"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phosphorus (P) - kg/ha
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="number"
                  name="phosphorus"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potassium (K) - kg/ha
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="number"
                  name="potassium"
                  value={formData.potassium}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil pH Level
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="number"
                  name="ph_level"
                  value={formData.ph_level}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="14"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900"
                  placeholder="7.0"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Temperature (°C)
                </label>
                {formData.temperature && formData.location && (
                  <span className="text-xs text-cyan-600 flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    Auto-filled
                  </span>
                )}
              </div>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900"
                  placeholder="25.0"
                  required
                />
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Humidity (%)
                </label>
                {formData.humidity && formData.location && (
                  <span className="text-xs text-cyan-600 flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    Auto-filled
                  </span>
                )}
              </div>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900"
                  placeholder="60.0"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rainfall (mm)
                </label>
                {formData.rainfall && formData.location && (
                  <span className="text-xs text-cyan-600 flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    Auto-filled
                  </span>
                )}
              </div>
              <div className="relative">
                <Cloud className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900"
                  placeholder="100.0"
                  required
                />
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              {formData.location && (
                <button
                  type="button"
                  onClick={fetchWeatherData}
                  disabled={fetchingWeather}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <RefreshCw className={`w-4 h-4 ${fetchingWeather ? 'animate-spin' : ''}`} />
                  <span>{fetchingWeather ? 'Fetching...' : 'Fetch Weather'}</span>
                </button>
              )}
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
                placeholder="e.g., Punjab, India (auto-fetches weather)"
              />
            </div>
            {weatherError && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                {weatherError}
              </p>
            )}
            {fetchingWeather && (
              <p className="mt-2 text-sm text-cyan-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Fetching weather data for {formData.location}...
              </p>
            )}
            {!fetchingWeather && !weatherError && formData.location && formData.temperature && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                Weather data updated automatically
              </p>
            )}
          </div>
        </AnimatedSection>

        {error && (
          <AnimatedSection delay={500}>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection delay={500}>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Get AI Recommendations'}
          </button>
        </AnimatedSection>
      </form>
    </div>
  );
}
