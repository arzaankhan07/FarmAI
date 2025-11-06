import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Package, TrendingUp, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface SoilData {
  id: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph_level: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  location: string;
  created_at: string;
}

export function RecommendationDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latestSoilData, setLatestSoilData] = useState<SoilData | null>(null);

  const [cropPrediction, setCropPrediction] = useState<any>(null);
  const [fertilizerRec, setFertilizerRec] = useState<any>(null);
  const [yieldPrediction, setYieldPrediction] = useState<any>(null);

  useEffect(() => {
    loadLatestData();
  }, []);

  const loadLatestData = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: soilData, error: soilError } = await supabase
        .from('soil_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (soilError) throw soilError;
      if (!soilData) {
        setError('No soil data found. Please add soil data first.');
        setLoading(false);
        return;
      }

      setLatestSoilData(soilData);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const cropResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-crop`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ soil_data_id: soilData.id }),
        }
      );

      if (!cropResponse.ok) throw new Error('Failed to get crop prediction');
      const cropData = await cropResponse.json();
      setCropPrediction(cropData);

      const fertilizerResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-fertilizer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            soil_data_id: soilData.id,
            crop: cropData.crop
          }),
        }
      );

      if (!fertilizerResponse.ok) throw new Error('Failed to get fertilizer recommendation');
      const fertilizerData = await fertilizerResponse.json();
      setFertilizerRec(fertilizerData);

      const yieldResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-yield`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            soil_data_id: soilData.id,
            crop: cropData.crop
          }),
        }
      );

      if (!yieldResponse.ok) throw new Error('Failed to get yield prediction');
      const yieldData = await yieldResponse.json();
      setYieldPrediction(yieldData);

    } catch (err) {
      setError('Failed to load recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!cropPrediction) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <p className="text-gray-600">No recommendations available. Please add soil data first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">AI-Powered Recommendations</h2>
        <p className="text-green-50">Based on your latest soil and environmental data</p>
      </div>

      {latestSoilData && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Conditions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nitrogen</p>
              <p className="text-lg font-semibold text-gray-800">{latestSoilData.nitrogen} kg/ha</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phosphorus</p>
              <p className="text-lg font-semibold text-gray-800">{latestSoilData.phosphorus} kg/ha</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Potassium</p>
              <p className="text-lg font-semibold text-gray-800">{latestSoilData.potassium} kg/ha</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">pH Level</p>
              <p className="text-lg font-semibold text-gray-800">{latestSoilData.ph_level}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-800">Crop Recommendation</h3>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-green-700 mb-1">Recommended Crop</p>
              <h4 className="text-3xl font-bold text-green-900">{cropPrediction.crop}</h4>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700 mb-1">Confidence</p>
              <p className="text-2xl font-bold text-green-900">
                {(cropPrediction.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${cropPrediction.confidence * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{cropPrediction.reasoning}</p>
        </div>

        {cropPrediction.alternates && cropPrediction.alternates.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Alternative Crops:</p>
            <div className="flex flex-wrap gap-2">
              {cropPrediction.alternates.map((crop: string) => (
                <span
                  key={crop}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {crop}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {fertilizerRec && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Fertilizer Recommendation</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">Fertilizer Type</p>
              <p className="text-xl font-bold text-blue-900">{fertilizerRec.type}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Recommended Dosage</p>
                <p className="text-lg font-semibold text-gray-800">{fertilizerRec.dosage}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Application Timing</p>
                <p className="text-lg font-semibold text-gray-800">{fertilizerRec.timing}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {yieldPrediction && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-800">Yield Prediction</h3>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-4">
            <p className="text-sm text-orange-700 mb-1">Expected Yield</p>
            <h4 className="text-4xl font-bold text-orange-900 mb-2">
              {yieldPrediction.yield} <span className="text-2xl">tons/hectare</span>
            </h4>
            <p className="text-sm text-orange-700">
              Range: {yieldPrediction.confidenceInterval.lower} - {yieldPrediction.confidenceInterval.upper} tons/hectare
            </p>
          </div>

          {yieldPrediction.factors && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Key Factors Assessment:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(yieldPrediction.factors).map(([factor, status]: [string, any]) => (
                  <div key={factor} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">{factor}</p>
                    <div className="flex items-center gap-1">
                      {(status === 'Excellent' || status === 'Ideal' || status === 'Optimal') && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <p className="text-sm font-semibold text-gray-800">{status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
