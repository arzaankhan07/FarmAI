import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Package, TrendingUp, AlertCircle, CheckCircle, Loader, Info, Brain, Database, BarChart3 } from 'lucide-react';
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
      <AnimatedSection delay={0}>
        <div className="bg-emerald-600 rounded-xl p-6 text-white shadow-md">
          <h2 className="text-2xl font-bold mb-2">AI-Powered Recommendations</h2>
          <p className="text-emerald-50">Based on your latest soil and environmental data</p>
        </div>
      </AnimatedSection>

      {/* How It Works Section */}
      <AnimatedSection delay={100}>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-600">
          <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl font-semibold text-gray-900">How Our AI Recommendations Work</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Our AI-powered recommendation system uses advanced machine learning algorithms to analyze your soil data 
            and provide personalized farming recommendations. Here's how it works:
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-8 h-8 text-purple-600" />
                <h4 className="font-semibold text-gray-800">Data Analysis</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our system analyzes your soil parameters including Nitrogen (N), Phosphorus (P), Potassium (K), 
                pH levels, temperature, humidity, and rainfall patterns to understand your soil's current condition.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-8 h-8 text-blue-600" />
                <h4 className="font-semibold text-gray-800">AI Processing</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Advanced machine learning models trained on thousands of farming datasets compare your soil data 
                against optimal growing conditions for different crops, fertilizers, and yield patterns.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-8 h-8 text-emerald-600" />
                <h4 className="font-semibold text-gray-900">Smart Recommendations</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Based on the analysis, the system generates personalized recommendations for the best crops to grow, 
                optimal fertilizer types and dosages, and accurate yield predictions with confidence intervals.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Key Factors Considered
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>Soil Nutrients:</strong> N, P, K levels and their ratios</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>pH Balance:</strong> Acidity/alkalinity affecting nutrient availability</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>Climate Data:</strong> Temperature, humidity, and rainfall patterns</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>Crop Compatibility:</strong> Historical success rates for your conditions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>Fertilizer Efficiency:</strong> Optimal nutrient supplementation needs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>Yield Potential:</strong> Expected harvest based on all factors</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These recommendations are based on AI analysis and should be used as a guide. 
              Always consult with local agricultural experts and consider regional farming practices for best results.
            </p>
          </div>
          </div>
        </div>
      </AnimatedSection>

      {latestSoilData && (
        <AnimatedSection delay={200}>
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
        </AnimatedSection>
      )}

      <AnimatedSection delay={300}>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl font-semibold text-gray-900">Crop Recommendation</h3>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-emerald-700 mb-1">Recommended Crop</p>
              <h4 className="text-3xl font-bold text-emerald-900">{cropPrediction.crop}</h4>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-700 mb-1">Confidence</p>
              <p className="text-2xl font-bold text-emerald-900">
                {(cropPrediction.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${cropPrediction.confidence * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed mb-3">{cropPrediction.reasoning}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              How This Recommendation Was Generated:
            </p>
            <p className="text-sm text-blue-800 leading-relaxed">
              Our AI analyzed your soil's nutrient composition (N: {latestSoilData?.nitrogen}, P: {latestSoilData?.phosphorus}, K: {latestSoilData?.potassium}), 
              pH level ({latestSoilData?.ph_level}), and environmental conditions (Temperature: {latestSoilData?.temperature}°C, 
              Rainfall: {latestSoilData?.rainfall}mm) to match against optimal growing conditions for various crops. 
              The recommendation is based on compatibility scores calculated from historical farming data and scientific research.
            </p>
          </div>
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
      </AnimatedSection>

      {fertilizerRec && (
        <AnimatedSection delay={400}>
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

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                How This Recommendation Was Generated:
              </p>
              <p className="text-sm text-purple-800 leading-relaxed">
                The fertilizer recommendation is calculated based on the nutrient gaps in your soil. 
                Your current N-P-K levels were compared against the optimal requirements for {cropPrediction.crop}. 
                The AI determined that <strong>{fertilizerRec.type}</strong> is needed to balance your soil's nutrient profile 
                and maximize crop growth potential. The dosage and timing are optimized for your specific soil conditions 
                and the recommended crop's growth cycle.
              </p>
            </div>
          </div>
        </div>
        </AnimatedSection>
      )}

      {yieldPrediction && (
        <AnimatedSection delay={500}>
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
            <div className="mb-4">
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

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              How This Prediction Was Generated:
            </p>
            <p className="text-sm text-emerald-800 leading-relaxed mb-2">
              The yield prediction uses a regression model that considers multiple variables:
            </p>
            <ul className="text-sm text-emerald-800 space-y-1 ml-4 list-disc">
              <li>Your soil's nutrient levels and their balance (N-P-K ratio)</li>
              <li>pH level and its impact on nutrient availability</li>
              <li>Environmental conditions (temperature: {latestSoilData?.temperature}°C, rainfall: {latestSoilData?.rainfall}mm)</li>
              <li>Historical yield data for {cropPrediction.crop} under similar conditions</li>
              <li>Optimal growing conditions for the recommended crop</li>
            </ul>
            <p className="text-sm text-emerald-800 leading-relaxed mt-2">
              The confidence interval ({yieldPrediction.confidenceInterval.lower} - {yieldPrediction.confidenceInterval.upper} tons/hectare) 
              accounts for natural variability and potential environmental factors that may affect the actual yield.
            </p>
          </div>
        </div>
        </AnimatedSection>
      )}
    </div>
  );
}
