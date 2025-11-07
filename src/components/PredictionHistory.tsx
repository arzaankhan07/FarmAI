import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Leaf, Package, TrendingUp, MapPin, Trash2 } from 'lucide-react';
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prediction record?')) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('crop_recommendations')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Remove from local state
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('Failed to delete record. Please try again.');
    } finally {
      setDeletingId(null);
    }
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
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      <AnimatedSection delay={0}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Prediction History
          </h2>
          <p className="text-gray-600 mt-1">View your past recommendations and predictions</p>
        </div>
      </AnimatedSection>

      <div className="divide-y divide-gray-200">
        {history.map((item, index) => (
          <AnimatedSection key={item.id} delay={index * 100}>
            <div className="p-6 hover:bg-emerald-50 transition-all duration-200 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(item.created_at)}</span>
              </div>
              <div className="flex items-center gap-4">
                {item.soil_data?.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{item.soil_data.location}</span>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete this record"
                >
                  <Trash2 className={`w-4 h-4 ${deletingId === item.id ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">Crop</p>
                </div>
                <p className="text-lg font-bold text-emerald-900">{item.crop}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">Fertilizer</p>
                </div>
                <p className="text-sm font-semibold text-blue-900">{item.fertilizer}</p>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm font-medium text-indigo-700">Yield</p>
                </div>
                <p className="text-lg font-bold text-indigo-900">
                  {item.yield > 0 ? `${item.yield} t/ha` : 'N/A'}
                </p>
              </div>
            </div>

            {item.soil_data && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2 font-medium">Soil Conditions</p>
                <div className="flex gap-4 text-sm">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">N: {item.soil_data.nitrogen} kg/ha</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">P: {item.soil_data.phosphorus} kg/ha</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">K: {item.soil_data.potassium} kg/ha</span>
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
