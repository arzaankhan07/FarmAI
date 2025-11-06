import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Leaf, Package, TrendingUp, MapPin } from 'lucide-react';

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
      <div className="bg-white rounded-xl shadow-sm p-8">
        <p className="text-gray-600">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <p className="text-gray-600">No prediction history yet. Start by adding soil data and getting recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Prediction History</h2>
        <p className="text-gray-600 mt-1">View your past recommendations and predictions</p>
      </div>

      <div className="divide-y divide-gray-200">
        {history.map((item) => (
          <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-700">Crop</p>
                </div>
                <p className="text-lg font-bold text-green-900">{item.crop}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">Fertilizer</p>
                </div>
                <p className="text-sm font-semibold text-blue-900">{item.fertilizer}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-medium text-orange-700">Yield</p>
                </div>
                <p className="text-lg font-bold text-orange-900">
                  {item.yield > 0 ? `${item.yield} t/ha` : 'N/A'}
                </p>
              </div>
            </div>

            {item.soil_data && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Soil Conditions</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>N: {item.soil_data.nitrogen} kg/ha</span>
                  <span>P: {item.soil_data.phosphorus} kg/ha</span>
                  <span>K: {item.soil_data.potassium} kg/ha</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
