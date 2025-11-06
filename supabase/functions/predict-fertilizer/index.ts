import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FertilizerInput {
  crop: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph_level: number;
}

function recommendFertilizer(input: FertilizerInput): { type: string; dosage: string; timing: string } {
  const { crop, nitrogen, phosphorus, potassium, ph_level } = input;

  const cropRequirements: Record<string, { n: number; p: number; k: number }> = {
    "Rice": { n: 100, p: 50, k: 50 },
    "Wheat": { n: 60, p: 40, k: 40 },
    "Maize": { n: 80, p: 45, k: 45 },
    "Cotton": { n: 80, p: 40, k: 40 },
    "Sugarcane": { n: 125, p: 65, k: 65 },
    "Soybean": { n: 40, p: 40, k: 40 },
  };

  const required = cropRequirements[crop] || { n: 60, p: 40, k: 40 };

  const nDeficit = Math.max(0, required.n - nitrogen);
  const pDeficit = Math.max(0, required.p - phosphorus);
  const kDeficit = Math.max(0, required.k - potassium);

  let fertilizerType = "";
  let dosage = "";
  let timing = "";

  if (nDeficit > 20 && pDeficit > 10 && kDeficit > 10) {
    fertilizerType = "NPK Complex (20-20-20)";
    const amount = Math.max(nDeficit, pDeficit, kDeficit) * 2;
    dosage = `${amount.toFixed(0)} kg/hectare`;
    timing = "Apply 50% at sowing/planting and 50% 30 days after planting";
  } else if (nDeficit > 15) {
    fertilizerType = "Urea (46-0-0)";
    dosage = `${(nDeficit * 2.2).toFixed(0)} kg/hectare`;
    timing = "Split application: 1/3 at sowing, 1/3 at 30 days, 1/3 at 60 days";
  } else if (pDeficit > 10) {
    fertilizerType = "Single Super Phosphate (SSP 16% P2O5)";
    dosage = `${(pDeficit * 6.25).toFixed(0)} kg/hectare`;
    timing = "Apply at time of sowing/planting as basal dose";
  } else if (kDeficit > 10) {
    fertilizerType = "Muriate of Potash (MOP 60% K2O)";
    dosage = `${(kDeficit * 1.67).toFixed(0)} kg/hectare`;
    timing = "Apply 50% at sowing and 50% at flowering stage";
  } else {
    fertilizerType = "Balanced NPK (12-32-16)";
    dosage = "50 kg/hectare";
    timing = "Apply at sowing/planting as maintenance dose";
  }

  if (ph_level < 6.0) {
    timing += " | Note: Consider applying lime to increase soil pH before fertilization.";
  } else if (ph_level > 7.5) {
    timing += " | Note: Consider adding sulfur or organic matter to reduce soil pH.";
  }

  return { type: fertilizerType, dosage, timing };
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

    const recommendation = recommendFertilizer({
      crop,
      nitrogen: soilData.nitrogen,
      phosphorus: soilData.phosphorus,
      potassium: soilData.potassium,
      ph_level: soilData.ph_level,
    });

    const { error: insertError } = await supabase
      .from("fertilizer_recommendations")
      .insert({
        user_id: user.id,
        soil_data_id: soil_data_id,
        crop_type: crop,
        fertilizer_type: recommendation.type,
        dosage: recommendation.dosage,
        timing: recommendation.timing,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify(recommendation),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});