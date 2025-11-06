import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph_level: number;
  temperature: number;
  humidity: number;
  rainfall: number;
}

function predictCrop(data: SoilData): { crop: string; confidence: number; alternates: string[]; reasoning: string } {
  const { nitrogen, phosphorus, potassium, ph_level, temperature, humidity, rainfall } = data;

  const crops = [
    {
      name: "Rice",
      conditions: {
        n: [80, 120], p: [40, 60], k: [40, 60], ph: [5.5, 7.0],
        temp: [20, 35], humidity: [80, 90], rainfall: [150, 300]
      },
      season: "Kharif (Monsoon)"
    },
    {
      name: "Wheat",
      conditions: {
        n: [40, 80], p: [30, 50], k: [30, 50], ph: [6.0, 7.5],
        temp: [15, 25], humidity: [50, 70], rainfall: [50, 100]
      },
      season: "Rabi (Winter)"
    },
    {
      name: "Maize",
      conditions: {
        n: [60, 100], p: [30, 60], k: [30, 60], ph: [5.5, 7.0],
        temp: [18, 27], humidity: [60, 80], rainfall: [50, 100]
      },
      season: "Kharif"
    },
    {
      name: "Cotton",
      conditions: {
        n: [60, 100], p: [30, 50], k: [30, 50], ph: [6.0, 8.0],
        temp: [21, 30], humidity: [50, 80], rainfall: [50, 100]
      },
      season: "Kharif"
    },
    {
      name: "Sugarcane",
      conditions: {
        n: [100, 150], p: [50, 80], k: [50, 80], ph: [6.0, 7.5],
        temp: [20, 35], humidity: [70, 90], rainfall: [100, 200]
      },
      season: "Year-round"
    },
    {
      name: "Soybean",
      conditions: {
        n: [30, 50], p: [30, 50], k: [30, 50], ph: [6.0, 7.0],
        temp: [20, 30], humidity: [60, 80], rainfall: [50, 100]
      },
      season: "Kharif"
    },
  ];

  const scores = crops.map(crop => {
    const { conditions } = crop;
    let score = 0;
    let maxScore = 0;

    const factors = [
      { value: nitrogen, range: conditions.n, weight: 1.5 },
      { value: phosphorus, range: conditions.p, weight: 1.5 },
      { value: potassium, range: conditions.k, weight: 1.5 },
      { value: ph_level, range: conditions.ph, weight: 1.2 },
      { value: temperature, range: conditions.temp, weight: 1.3 },
      { value: humidity, range: conditions.humidity, weight: 1.0 },
      { value: rainfall, range: conditions.rainfall, weight: 1.2 },
    ];

    factors.forEach(({ value, range, weight }) => {
      maxScore += 100 * weight;
      const [min, max] = range;
      if (value >= min && value <= max) {
        score += 100 * weight;
      } else {
        const distance = value < min ? min - value : value - max;
        const rangeSize = max - min;
        const penalty = Math.min(distance / rangeSize, 1) * 100 * weight;
        score += Math.max(0, 100 * weight - penalty);
      }
    });

    return {
      crop: crop.name,
      score: (score / maxScore) * 100,
      season: crop.season,
    };
  });

  scores.sort((a, b) => b.score - a.score);

  const topCrop = scores[0];
  const alternates = scores.slice(1, 4).map(s => s.crop);

  let reasoning = `Based on your soil nutrient levels (N: ${nitrogen}, P: ${phosphorus}, K: ${potassium}) `;
  reasoning += `and environmental conditions (pH: ${ph_level}, Temp: ${temperature}°C, `;
  reasoning += `Humidity: ${humidity}%, Rainfall: ${rainfall}mm), `;
  reasoning += `${topCrop.crop} is the most suitable crop for ${topCrop.season} season. `;
  
  if (topCrop.score < 70) {
    reasoning += "However, soil amendments may be needed to optimize conditions.";
  } else {
    reasoning += "Your soil conditions are well-suited for this crop.";
  }

  return {
    crop: topCrop.crop,
    confidence: topCrop.score / 100,
    alternates,
    reasoning,
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

    const { soil_data_id } = await req.json();

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

    const prediction = predictCrop(soilData);

    const { error: insertError } = await supabase
      .from("crop_recommendations")
      .insert({
        user_id: user.id,
        soil_data_id: soil_data_id,
        recommended_crop: prediction.crop,
        confidence_score: prediction.confidence,
        alternate_crops: prediction.alternates,
        reasoning: prediction.reasoning,
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