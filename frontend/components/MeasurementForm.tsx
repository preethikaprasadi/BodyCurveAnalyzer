"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Flame,
  Dumbbell,
  Compass,
  ArrowRight,
} from "lucide-react";
import { FitnessGoal, ActivityLevel, MeasurementInput } from "@/types";
import { analyzeBody } from "@/lib/api";

const PRESETS = [
  {
    name: "Hourglass",
    shape: "hourglass",
    data: { height: 165, weight: 60, shoulder: 36, bust: 92, waist: 64, hip: 94 },
  },
  {
    name: "Rectangle",
    shape: "rectangle",
    data: { height: 168, weight: 62, shoulder: 37, bust: 89, waist: 76, hip: 90 },
  },
  {
    name: "Pear",
    shape: "pear",
    data: { height: 162, weight: 65, shoulder: 34, bust: 84, waist: 72, hip: 102 },
  },
  {
    name: "Inverted Triangle",
    shape: "inverted_triangle",
    data: { height: 172, weight: 64, shoulder: 44, bust: 98, waist: 70, hip: 88 },
  },
  {
    name: "Apple",
    shape: "apple",
    data: { height: 164, weight: 74, shoulder: 37, bust: 98, waist: 96, hip: 94 },
  },
];

export default function MeasurementForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<MeasurementInput>({
    height: 165,
    weight: 60,
    shoulder: 36,
    bust: 92,
    waist: 65,
    hip: 94,
    goal: "maintain",
    activityLevel: "beginner",
    saveRecord: true,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleInputChange = (field: keyof MeasurementInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const applyPreset = (presetData: any) => {
    setFormData((prev) => ({
      ...prev,
      ...presetData,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await analyzeBody(formData);
      if (response.success) {
        // Cache in sessionStorage for fast display on /results
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header bar */}
      <div className="p-6 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Enter Your Measurements</h2>
          <p className="text-sm text-slate-500 mt-1">
            Provide your circumferences in centimeters. Accurate measurements yield optimal proportion insights.
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
            Anatomical Measurement Best Practices:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Shoulder Width (cm)</span>
              Measure straight across your back between the bony edges (biacromial points) of each shoulder.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Bust / Chest (cm)</span>
              Wrap measuring tape comfortably around the fullest circumference of your chest, keeping tape parallel.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Natural Waist (cm)</span>
              Measure around the narrowest part of your torso, typically 2-3 cm above your navel.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Hip Circumference (cm)</span>
              Stand with feet together and measure around the widest, fullest projection of your buttocks.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Height (cm)</span>
              Total barefoot stature standing upright against a flat wall.
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-teal-700 block mb-1">Weight (kg)</span>
              Total body mass recorded in the morning before breakfast for consistency.
            </div>
          </div>
        </div>
      )}

      {/* Demo Data Presets */}
      <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-medium text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Quick Demo Presets:
        </span>
        <div className="flex gap-1.5 flex-nowrap">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset.data)}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-700 font-medium transition-all shadow-2xs whitespace-nowrap"
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
            <div className="relative rounded-xl shadow-2xs">
              <input
                type="number"
                step="0.5"
                min="100"
                max="250"
                required
                value={formData.height}
                onChange={(e) => handleInputChange("height", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">cm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Range: 100 - 250 cm</p>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Weight
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <input
                type="number"
                step="0.5"
                min="25"
                max="300"
                required
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Range: 25 - 300 kg</p>
          </div>

          {/* Shoulder Width */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shoulder Width
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <input
                type="number"
                step="0.5"
                min="20"
                max="80"
                required
                value={formData.shoulder}
                onChange={(e) => handleInputChange("shoulder", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">cm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across back bone-to-bone</p>
          </div>

          {/* Bust / Chest */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Bust / Chest
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <input
                type="number"
                step="0.5"
                min="40"
                max="200"
                required
                value={formData.bust}
                onChange={(e) => handleInputChange("bust", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">cm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Fullest chest circumference</p>
          </div>

          {/* Waist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Natural Waist
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <input
                type="number"
                step="0.5"
                min="30"
                max="200"
                required
                value={formData.waist}
                onChange={(e) => handleInputChange("waist", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">cm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Narrowest torso indent</p>
          </div>

          {/* Hip */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hips
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <input
                type="number"
                step="0.5"
                min="40"
                max="220"
                required
                value={formData.hip}
                onChange={(e) => handleInputChange("hip", parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">cm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Widest pelvic circumference</p>
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
              value={formData.goal}
              onChange={(e) => handleInputChange("goal", e.target.value as FitnessGoal)}
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
              value={formData.activityLevel}
              onChange={(e) => handleInputChange("activityLevel", e.target.value as ActivityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-medium text-sm"
            >
              <option value="beginner">Beginner (1-2 days / week)</option>
              <option value="intermediate">Intermediate (3-4 days / week)</option>
              <option value="advanced">Advanced (5+ days / week)</option>
            </select>
          </div>
        </div>

        {/* Auto-save Option */}
        <div className="flex items-center gap-3 pt-2">
          <input
            id="saveRecord"
            type="checkbox"
            checked={formData.saveRecord}
            onChange={(e) => handleInputChange("saveRecord", e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
          />
          <label htmlFor="saveRecord" className="text-sm font-medium text-slate-700 cursor-pointer">
            Save this entry to my local progress history
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
                Analyze Body Proportions
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
