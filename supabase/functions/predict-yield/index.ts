import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface YieldInput {
  crop: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph_level: number;
  temperature: number;
  humidity: number;
  rainfall: number;
}

function predictYield(input: YieldInput): { yield: number; confidenceInterval: { lower: number; upper: number }; factors: Record<string, string> } {
  const { crop, nitrogen, phosphorus, potassium, ph_level, temperature, humidity, rainfall } = input;

  const baseYields: Record<string, number> = {
    "Rice": 4.5,
    "Wheat": 3.5,
    "Maize": 5.0,
    "Cotton": 2.5,
    "Sugarcane": 70.0,
    "Soybean": 2.8,
  };

  const optimalConditions: Record<string, { n: number; p: number; k: number; ph: number; temp: number; humidity: number; rainfall: number }> = {
    "Rice": { n: 100, p: 50, k: 50, ph: 6.5, temp: 27, humidity: 85, rainfall: 200 },
    "Wheat": { n: 60, p: 40, k: 40, ph: 6.5, temp: 20, humidity: 60, rainfall: 75 },
    "Maize": { n: 80, p: 45, k: 45, ph: 6.5, temp: 22, humidity: 70, rainfall: 75 },
    "Cotton": { n: 80, p: 40, k: 40, ph: 7.0, temp: 25, humidity: 65, rainfall: 75 },
    "Sugarcane": { n: 125, p: 65, k: 65, ph: 6.5, temp: 27, humidity: 80, rainfall: 150 },
    "Soybean": { n: 40, p: 40, k: 40, ph: 6.5, temp: 25, humidity: 70, rainfall: 75 },
  };

  const baseYield = baseYields[crop] || 3.0;
  const optimal = optimalConditions[crop] || optimalConditions["Wheat"];

  const nFactor = 1 - Math.abs(nitrogen - optimal.n) / optimal.n * 0.3;
  const pFactor = 1 - Math.abs(phosphorus - optimal.p) / optimal.p * 0.25;
  const kFactor = 1 - Math.abs(potassium - optimal.k) / optimal.k * 0.25;
  const phFactor = 1 - Math.abs(ph_level - optimal.ph) / optimal.ph * 0.2;
  const tempFactor = 1 - Math.abs(temperature - optimal.temp) / optimal.temp * 0.25;
  const humidityFactor = 1 - Math.abs(humidity - optimal.humidity) / optimal.humidity * 0.15;
  const rainfallFactor = 1 - Math.abs(rainfall - optimal.rainfall) / optimal.rainfall * 0.3;

  const factors = {
    "Nitrogen": nFactor > 0.9 ? "Excellent" : nFactor > 0.7 ? "Good" : nFactor > 0.5 ? "Fair" : "Poor",
    "Phosphorus": pFactor > 0.9 ? "Excellent" : pFactor > 0.7 ? "Good" : pFactor > 0.5 ? "Fair" : "Poor",
    "Potassium": kFactor > 0.9 ? "Excellent" : kFactor > 0.7 ? "Good" : kFactor > 0.5 ? "Fair" : "Poor",
    "pH Level": phFactor > 0.9 ? "Optimal" : phFactor > 0.7 ? "Good" : phFactor > 0.5 ? "Fair" : "Needs adjustment",
    "Temperature": tempFactor > 0.9 ? "Ideal" : tempFactor > 0.7 ? "Suitable" : tempFactor > 0.5 ? "Manageable" : "Challenging",
    "Humidity": humidityFactor > 0.9 ? "Ideal" : humidityFactor > 0.7 ? "Suitable" : humidityFactor > 0.5 ? "Acceptable" : "Challenging",
    "Rainfall": rainfallFactor > 0.9 ? "Ideal" : rainfallFactor > 0.7 ? "Sufficient" : rainfallFactor > 0.5 ? "Adequate" : "Insufficient",
  };

  const allFactors = [nFactor, pFactor, kFactor, phFactor, tempFactor, humidityFactor, rainfallFactor];
  const avgFactor = allFactors.reduce((sum, f) => sum + Math.max(0, f), 0) / allFactors.length;

  const predictedYield = baseYield * avgFactor;
  const variance = predictedYield * 0.15;

  return {
    yield: parseFloat(predictedYield.toFixed(2)),
    confidenceInterval: {
      lower: parseFloat((predictedYield - variance).toFixed(2)),
      upper: parseFloat((predictedYield + variance).toFixed(2)),
    },
    factors,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { soil_data_id, crop } = await req.json();

    const { data: soilData, error: fetchError } = await supabase
      .from("soil_data")
      .select("*")
      .eq("id", soil_data_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !soilData) {
      return new Response(
        JSON.stringify({ error: "Soil data not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prediction = predictYield({
      crop,
      nitrogen: soilData.nitrogen,
      phosphorus: soilData.phosphorus,
      potassium: soilData.potassium,
      ph_level: soilData.ph_level,
      temperature: soilData.temperature,
      humidity: soilData.humidity,
      rainfall: soilData.rainfall,
    });

    const { error: insertError } = await supabase
      .from("yield_predictions")
      .insert({
        user_id: user.id,
        soil_data_id: soil_data_id,
        crop_type: crop,
        predicted_yield: prediction.yield,
        confidence_interval: prediction.confidenceInterval,
        factors: prediction.factors,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});