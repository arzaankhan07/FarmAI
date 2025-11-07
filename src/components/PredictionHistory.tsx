import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Leaf, Package, TrendingUp, MapPin } from 'lucide-react';
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

interface HistoryItem {
  id: string;
  created_at: string;
  soil_data: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    location: string;
  };
  crop: string;
  fertilizer: string;
  yield: number;
}

export function PredictionHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: cropData, error: cropError } = await supabase
        .from('crop_recommendations')
        .select(`
          id,
          created_at,
          recommended_crop,
          soil_data:soil_data_id (
            nitrogen,
            phosphorus,
            potassium,
            location
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (cropError) throw cropError;

      const { data: fertilizerData } = await supabase
        .from('fertilizer_recommendations')
        .select('soil_data_id, fertilizer_type')
        .eq('user_id', user?.id);

      const { data: yieldData } = await supabase
        .from('yield_predictions')
        .select('soil_data_id, predicted_yield')
        .eq('user_id', user?.id);

      const fertilizerMap = new Map(
        fertilizerData?.map(f => [f.soil_data_id, f.fertilizer_type]) || []
      );

      const yieldMap = new Map(
        yieldData?.map(y => [y.soil_data_id, y.predicted_yield]) || []
      );

      const combined = cropData?.map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        soil_data: item.soil_data,
        crop: item.recommended_crop,
        fertilizer: fertilizerMap.get(item.soil_data_id) || 'N/A',
        yield: yieldMap.get(item.soil_data_id) || 0,
      })) || [];

      setHistory(combined);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 border border-cyan-200/30">
        <p className="text-gray-600">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 border border-cyan-200/30">
        <p className="text-gray-600">No prediction history yet. Start by adding soil data and getting recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-cyan-200/30">
      <AnimatedSection delay={0}>
        <div className="p-6 border-b border-cyan-200/30">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
            Prediction History
          </h2>
          <p className="text-gray-600 mt-1">View your past recommendations and predictions</p>
        </div>
      </AnimatedSection>

      <div className="divide-y divide-cyan-200/30">
        {history.map((item, index) => (
          <AnimatedSection key={item.id} delay={index * 100}>
            <div className="p-6 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-cyan-50/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(item.created_at)}</span>
              </div>
              {item.soil_data?.location && (
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{item.soil_data.location}</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">Crop</p>
                </div>
                <p className="text-lg font-bold text-emerald-900">{item.crop}</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-cyan-600" />
                  <p className="text-sm font-medium text-cyan-700">Fertilizer</p>
                </div>
                <p className="text-sm font-semibold text-cyan-900">{item.fertilizer}</p>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                  <p className="text-sm font-medium text-violet-700">Yield</p>
                </div>
                <p className="text-lg font-bold text-violet-900">
                  {item.yield > 0 ? `${item.yield} t/ha` : 'N/A'}
                </p>
              </div>
            </div>

            {item.soil_data && (
              <div className="mt-4 pt-4 border-t border-cyan-200/30">
                <p className="text-xs text-gray-500 mb-2 font-medium">Soil Conditions</p>
                <div className="flex gap-4 text-sm">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">N: {item.soil_data.nitrogen} kg/ha</span>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full font-semibold">P: {item.soil_data.phosphorus} kg/ha</span>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-semibold">K: {item.soil_data.potassium} kg/ha</span>
                </div>
              </div>
            )}
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
