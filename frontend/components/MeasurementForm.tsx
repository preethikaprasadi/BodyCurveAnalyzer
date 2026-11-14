"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  HelpCircle,
  Sparkles,
  AlertCircle,
  Loader2,
  Compass,
  ArrowRight,
  User,
  Ruler,
} from "lucide-react";
import { FitnessGoal, ActivityLevel, MeasurementInput, Gender, UnitSystem } from "@/types";
import { analyzeBody } from "@/lib/api";

interface PresetItem {
  name: string;
  shape: string;
  metric: {
    height: number;
    weight: number;
    shoulder: number;
    bust: number;
    waist: number;
    hip: number;
  };
}

const FEMALE_PRESETS: PresetItem[] = [
  {
    name: "Hourglass",
    shape: "hourglass",
    metric: { height: 165, weight: 60, shoulder: 36, bust: 92, waist: 64, hip: 94 },
  },
  {
    name: "Rectangle",
    shape: "rectangle",
    metric: { height: 168, weight: 62, shoulder: 37, bust: 89, waist: 76, hip: 90 },
  },
  {
    name: "Pear",
    shape: "pear",
    metric: { height: 162, weight: 65, shoulder: 34, bust: 84, waist: 72, hip: 102 },
  },
  {
    name: "Inverted Triangle",
    shape: "inverted_triangle",
    metric: { height: 172, weight: 64, shoulder: 44, bust: 98, waist: 70, hip: 88 },
  },
  {
    name: "Apple",
    shape: "apple",
    metric: { height: 164, weight: 74, shoulder: 37, bust: 98, waist: 96, hip: 94 },
  },
];

const MALE_PRESETS: PresetItem[] = [
  {
    name: "Trapezoid",
    shape: "trapezoid",
    metric: { height: 178, weight: 76, shoulder: 45, bust: 104, waist: 82, hip: 96 },
  },
  {
    name: "Inverted Triangle",
    shape: "inverted_triangle",
    metric: { height: 182, weight: 82, shoulder: 49, bust: 110, waist: 78, hip: 92 },
  },
  {
    name: "Rectangle",
    shape: "rectangle",
    metric: { height: 176, weight: 71, shoulder: 42, bust: 96, waist: 86, hip: 95 },
  },
  {
    name: "Triangle",
    shape: "triangle",
    metric: { height: 173, weight: 77, shoulder: 40, bust: 92, waist: 94, hip: 101 },
  },
  {
    name: "Oval",
    shape: "oval",
    metric: { height: 175, weight: 89, shoulder: 43, bust: 105, waist: 108, hip: 102 },
  },
];

// Conversion utilities
function cmToIn(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

function inToCm(inch: number): number {
  return Math.round(inch * 2.54 * 10) / 10;
}

function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalInches = cm / 2.54;
  let ft = Math.floor(totalInches / 12);
  let inch = Math.round(totalInches % 12);
  if (inch === 12) {
    ft += 1;
    inch = 0;
  }
  return { ft, in: inch };
}

function ftInToCm(ft: number, inch: number): number {
  return Math.round(((ft * 12) + inch) * 2.54 * 10) / 10;
}

export default function MeasurementForm() {
  const router = useRouter();
  const { user } = useAuth();

  const [gender, setGender] = useState<Gender>("female");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  // Metric canonical state (always kept up-to-date)
  const [metricData, setMetricData] = useState({
    height: 165,
    weight: 60,
    shoulder: 36,
    bust: 92,
    waist: 65,
    hip: 94,
  });

  // Imperial display fields (for when unitSystem === 'imperial')
  const [imperialHeightFt, setImperialHeightFt] = useState(5);
  const [imperialHeightIn, setImperialHeightIn] = useState(5);
  const [imperialWeight, setImperialWeight] = useState(132.3);
  const [imperialShoulder, setImperialShoulder] = useState(14.2);
  const [imperialBust, setImperialBust] = useState(36.2);
  const [imperialWaist, setImperialWaist] = useState(25.6);
  const [imperialHip, setImperialHip] = useState(37.0);

  const [goal, setGoal] = useState<FitnessGoal>("maintain");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("beginner");
  const [saveRecord, setSaveRecord] = useState(true);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Sync imperial fields when metric values change
  const syncImperialFromMetric = React.useCallback((metric: typeof metricData) => {
    const { ft, in: inch } = cmToFtIn(metric.height);
    setImperialHeightFt(ft);
    setImperialHeightIn(inch);
    setImperialWeight(kgToLbs(metric.weight));
    setImperialShoulder(cmToIn(metric.shoulder));
    setImperialBust(cmToIn(metric.bust));
    setImperialWaist(cmToIn(metric.waist));
    setImperialHip(cmToIn(metric.hip));
  }, []);

  const applyPresetMetric = React.useCallback((presetMetric: typeof metricData) => {
    setMetricData(presetMetric);
    syncImperialFromMetric(presetMetric);
    setError(null);
  }, [syncImperialFromMetric]);

  // Initialize from authenticated user profile
  useEffect(() => {
    if (user) {
      if (user.gender === "male" || user.gender === "female") {
        setGender(user.gender);
        // Switch preset to appropriate default if not already configured
        if (user.gender === "male") {
          applyPresetMetric(MALE_PRESETS[0].metric);
        }
      }
      if (user.goal) setGoal(user.goal as FitnessGoal);
      if (user.activityLevel) setActivityLevel(user.activityLevel as ActivityLevel);
    }
  }, [user, applyPresetMetric]);

  // Toggle gender
  const handleGenderToggle = (newGender: Gender) => {
    setGender(newGender);
    if (newGender === "male") {
      applyPresetMetric(MALE_PRESETS[0].metric);
    } else {
      applyPresetMetric(FEMALE_PRESETS[0].metric);
    }
  };

  // Toggle Unit System
  const handleUnitToggle = (newUnit: UnitSystem) => {
    if (newUnit === unitSystem) return;
    if (newUnit === "imperial") {
      syncImperialFromMetric(metricData);
    } else {
      // Sync metric from imperial
      const newCm = ftInToCm(imperialHeightFt, imperialHeightIn);
      const newKg = lbsToKg(imperialWeight);
      const newShoulder = inToCm(imperialShoulder);
      const newBust = inToCm(imperialBust);
      const newWaist = inToCm(imperialWaist);
      const newHip = inToCm(imperialHip);
      setMetricData({
        height: newCm,
        weight: newKg,
        shoulder: newShoulder,
        bust: newBust,
        waist: newWaist,
        hip: newHip,
      });
    }
    setUnitSystem(newUnit);
  };

  // Handle Imperial Inputs
  const handleImperialHeightChange = (ft: number, inch: number) => {
    setImperialHeightFt(ft);
    setImperialHeightIn(inch);
    const cm = ftInToCm(ft, inch);
    setMetricData((prev) => ({ ...prev, height: cm }));
  };

  const handleImperialWeightChange = (lbs: number) => {
    setImperialWeight(lbs);
    setMetricData((prev) => ({ ...prev, weight: lbsToKg(lbs) }));
  };

  const handleImperialCircumferenceChange = (field: "shoulder" | "bust" | "waist" | "hip", inches: number) => {
    if (field === "shoulder") setImperialShoulder(inches);
    if (field === "bust") setImperialBust(inches);
    if (field === "waist") setImperialWaist(inches);
    if (field === "hip") setImperialHip(inches);
    setMetricData((prev) => ({ ...prev, [field]: inToCm(inches) }));
  };

  // Handle Metric Inputs
  const handleMetricChange = (field: keyof typeof metricData, val: number) => {
    setMetricData((prev) => {
      const updated = { ...prev, [field]: val };
      if (unitSystem === "imperial") {
        syncImperialFromMetric(updated);
      }
      return updated;
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Calculate final metric values
    const finalHeight = unitSystem === "imperial" ? ftInToCm(imperialHeightFt, imperialHeightIn) : metricData.height;
    const finalWeight = unitSystem === "imperial" ? lbsToKg(imperialWeight) : metricData.weight;
    const finalShoulder = unitSystem === "imperial" ? inToCm(imperialShoulder) : metricData.shoulder;
    const finalBust = unitSystem === "imperial" ? inToCm(imperialBust) : metricData.bust;
    const finalWaist = unitSystem === "imperial" ? inToCm(imperialWaist) : metricData.waist;
    const finalHip = unitSystem === "imperial" ? inToCm(imperialHip) : metricData.hip;

    const payload: MeasurementInput = {
      height: finalHeight,
      weight: finalWeight,
      shoulder: finalShoulder,
      bust: finalBust,
      waist: finalWaist,
      hip: finalHip,
      gender,
      unitSystem,
      goal,
      activityLevel,
      saveRecord,
      notes,
      userId: user?.id || "guest",
    };

    try {
      const response = await analyzeBody(payload);
      if (response.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("bodycurve_latest_analysis", JSON.stringify(response));
        }
        router.push("/results");
      } else {
        setError(response.error || "Analysis failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach analysis server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const activePresets = gender === "male" ? MALE_PRESETS : FEMALE_PRESETS;
  const chestLabel = gender === "male" ? "Chest Circumference" : "Bust Circumference";
  const chestDesc = gender === "male" ? "Fullest chest/pectoral circumference" : "Fullest bust circumference";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header bar */}
      <div className="p-6 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Enter Your Measurements</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tailored analysis for {gender === "male" ? "gentlemen" : "women"} using anatomical proportion modeling.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors self-start sm:self-center"
        >
          <HelpCircle className="w-4 h-4" />
          {showGuide ? "Hide Measuring Guide" : "How to Measure"}
        </button>
      </div>

      {/* Expandable Measurement Guide */}
      {showGuide && (
        <div className="p-6 bg-slate-50 border-b border-slate-200 text-sm text-slate-700">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600" />
            Anatomical Measurement Best Practices ({gender === "male" ? "Men's Guide" : "Women's Guide"}):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Shoulder Width</span>
              Measure straight across your back between the bony acromion points of each shoulder.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">{chestLabel}</span>
              Wrap measuring tape comfortably around the fullest projection of your {gender === "male" ? "chest across the nipples" : "bust"}.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Natural Waist</span>
              Measure around the natural waist (narrowest torso point, usually 2-3 cm above the navel).
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Hip Circumference</span>
              Stand with feet together and measure around the widest projection of your buttocks.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Height</span>
              Total barefoot stature standing upright against a flat wall.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Weight</span>
              Body mass recorded in the morning before meals for accurate BMI tracking.
            </div>
          </div>
        </div>
      )}

      {/* Gender & Unit System Selectors Bar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Gender Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-600" /> Silhouette:
          </span>
          <div className="inline-flex rounded-xl p-1 bg-white border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleGenderToggle("female")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                gender === "female"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Female Silhouette
            </button>
            <button
              type="button"
              onClick={() => handleGenderToggle("male")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                gender === "male"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Male Silhouette (Gents)
            </button>
          </div>
        </div>

        {/* Unit System Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-teal-600" /> Units:
          </span>
          <div className="inline-flex rounded-xl p-1 bg-white border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleUnitToggle("metric")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                unitSystem === "metric"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Metric (cm, kg)
            </button>
            <button
              type="button"
              onClick={() => handleUnitToggle("imperial")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                unitSystem === "imperial"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Imperial (in, lbs, ft&apos;in)
            </button>
          </div>
        </div>
      </div>

      {/* Quick Demo Presets */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-600 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          {gender === "male" ? "Gents Presets:" : "Ladies Presets:"}
        </span>
        <div className="flex gap-1.5 flex-nowrap">
          {activePresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPresetMetric(preset.metric)}
              className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-700 text-slate-700 font-medium transition-all shadow-2xs whitespace-nowrap cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Validation Error</p>
              <p className="mt-0.5 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Measurement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Height */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Height
            </label>
            {unitSystem === "metric" ? (
              <div className="relative rounded-xl shadow-2xs">
                <input
                  type="number"
                  step="0.5"
                  min="100"
                  max="250"
                  required
                  value={metricData.height}
                  onChange={(e) => handleMetricChange("height", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">cm</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative rounded-xl shadow-2xs">
                  <input
                    type="number"
                    min="3"
                    max="8"
                    required
                    value={imperialHeightFt}
                    onChange={(e) => handleImperialHeightChange(parseInt(e.target.value) || 0, imperialHeightIn)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">ft</span>
                </div>
                <div className="relative rounded-xl shadow-2xs">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    required
                    value={imperialHeightIn}
                    onChange={(e) => handleImperialHeightChange(imperialHeightFt, parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">in</span>
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              {unitSystem === "metric" ? "Range: 100 - 250 cm" : "Barefoot total stature (ft & in)"}
            </p>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Weight
            </label>
            <div className="relative rounded-xl shadow-2xs">
              {unitSystem === "metric" ? (
                <input
                  type="number"
                  step="0.5"
                  min="25"
                  max="300"
                  required
                  value={metricData.weight}
                  onChange={(e) => handleMetricChange("weight", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              ) : (
                <input
                  type="number"
                  step="0.5"
                  min="55"
                  max="660"
                  required
                  value={imperialWeight}
                  onChange={(e) => handleImperialWeightChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              )}
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                {unitSystem === "metric" ? "kg" : "lbs"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {unitSystem === "metric" ? "Range: 25 - 300 kg" : "Total body mass in pounds"}
            </p>
          </div>

          {/* Shoulder Width */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shoulder Width
            </label>
            <div className="relative rounded-xl shadow-2xs">
              {unitSystem === "metric" ? (
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="80"
                  required
                  value={metricData.shoulder}
                  onChange={(e) => handleMetricChange("shoulder", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              ) : (
                <input
                  type="number"
                  step="0.1"
                  min="8"
                  max="32"
                  required
                  value={imperialShoulder}
                  onChange={(e) => handleImperialCircumferenceChange("shoulder", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              )}
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                {unitSystem === "metric" ? "cm" : "in"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across back bone-to-bone (biacromial)</p>
          </div>

          {/* Bust / Chest */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {chestLabel}
            </label>
            <div className="relative rounded-xl shadow-2xs">
              {unitSystem === "metric" ? (
                <input
                  type="number"
                  step="0.5"
                  min="40"
                  max="200"
                  required
                  value={metricData.bust}
                  onChange={(e) => handleMetricChange("bust", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              ) : (
                <input
                  type="number"
                  step="0.1"
                  min="16"
                  max="80"
                  required
                  value={imperialBust}
                  onChange={(e) => handleImperialCircumferenceChange("bust", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              )}
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                {unitSystem === "metric" ? "cm" : "in"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{chestDesc}</p>
          </div>

          {/* Waist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Natural Waist
            </label>
            <div className="relative rounded-xl shadow-2xs">
              {unitSystem === "metric" ? (
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="200"
                  required
                  value={metricData.waist}
                  onChange={(e) => handleMetricChange("waist", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              ) : (
                <input
                  type="number"
                  step="0.1"
                  min="12"
                  max="80"
                  required
                  value={imperialWaist}
                  onChange={(e) => handleImperialCircumferenceChange("waist", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              )}
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                {unitSystem === "metric" ? "cm" : "in"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Narrowest torso indent above navel</p>
          </div>

          {/* Hip */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hips / Pelvis
            </label>
            <div className="relative rounded-xl shadow-2xs">
              {unitSystem === "metric" ? (
                <input
                  type="number"
                  step="0.5"
                  min="40"
                  max="220"
                  required
                  value={metricData.hip}
                  onChange={(e) => handleMetricChange("hip", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              ) : (
                <input
                  type="number"
                  step="0.1"
                  min="16"
                  max="88"
                  required
                  value={imperialHip}
                  onChange={(e) => handleImperialCircumferenceChange("hip", parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
                />
              )}
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                {unitSystem === "metric" ? "cm" : "in"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Widest pelvic projection around buttocks</p>
          </div>
        </div>

        {/* Goal & Activity Selection */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Fitness Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Wellness & Fitness Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as FitnessGoal)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
            >
              <option value="maintain">Balance & Maintenance</option>
              <option value="muscle_gain">Muscle Tone & Hypertrophy</option>
              <option value="fat_loss">Fat Loss & Conditioning</option>
              <option value="mobility">Posture & Joint Mobility</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
            >
              <option value="beginner">Beginner (1-2 days / week)</option>
              <option value="intermediate">Intermediate (3-4 days / week)</option>
              <option value="advanced">Advanced (5+ days / week)</option>
            </select>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Personal Notes / Observations (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Post-workout morning check-in"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 text-sm"
          />
        </div>

        {/* Auto-save Option */}
        <div className="flex items-center gap-3 pt-2">
          <input
            id="saveRecord"
            type="checkbox"
            checked={saveRecord}
            onChange={(e) => setSaveRecord(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
          />
          <label htmlFor="saveRecord" className="text-sm font-medium text-slate-700 cursor-pointer">
            Save this entry to my progress history
          </label>
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base shadow-sm transition-all hover:shadow disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Proportions via ML...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Body Proportions ({gender === "male" ? "Gents" : "Ladies"})
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
