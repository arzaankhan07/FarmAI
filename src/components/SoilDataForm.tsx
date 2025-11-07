import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Droplets, Thermometer, Cloud, Activity } from 'lucide-react';
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
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 border border-cyan-200/30">
      <AnimatedSection delay={0}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent mb-2">
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
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                <input
                  type="number"
                  name="nitrogen"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-11 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
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
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                <input
                  type="number"
                  name="phosphorus"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-11 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
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
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500" />
                <input
                  type="number"
                  name="potassium"
                  value={formData.potassium}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-11 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
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
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                <input
                  type="number"
                  name="ph_level"
                  value={formData.ph_level}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="14"
                  className="w-full pl-11 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
                  placeholder="7.0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (°C)
              </label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full pl-11 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Humidity (%)
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full pl-11 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
                  placeholder="60.0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rainfall (mm)
              </label>
              <div className="relative">
                <Cloud className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className="w-full pl-11 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
                  placeholder="100.0"
                  required
                />
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
              placeholder="e.g., Punjab, India"
            />
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
            className="w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-violet-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Analyzing...' : 'Get AI Recommendations'}
          </button>
        </AnimatedSection>
      </form>
    </div>
  );
}
