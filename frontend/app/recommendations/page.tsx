"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecommendationsTabs from "@/components/RecommendationsTabs";
import { RecommendationsData, FitnessGoal, ActivityLevel } from "@/types";
import { getRecommendations } from "@/lib/api";
import { Compass, Sparkles, Filter, Loader2 } from "lucide-react";

const BODY_SHAPES = [
  { id: "hourglass", label: "Hourglass" },
  { id: "rectangle", label: "Rectangle" },
  { id: "pear", label: "Pear / Triangle" },
  { id: "inverted_triangle", label: "Inverted Triangle" },
  { id: "apple", label: "Apple / Oval" },
];

export default function RecommendationsPage() {
  const [selectedShape, setSelectedShape] = useState("hourglass");
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>("maintain");
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel>("beginner");

  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGuidance = async () => {
    setLoading(true);
    try {
      const data = await getRecommendations(selectedShape, selectedGoal, selectedLevel);
      setRecommendations(data);
    } catch (e) {
      console.warn("Failed to fetch recommendations", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidance();
  }, [selectedShape, selectedGoal, selectedLevel]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            Style & Fitness Guide
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Proportion Guidance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse rule-based recommendations across silhouettes, goals, and training experience levels.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            Customize Recommendation Parameters
          </div>

          <div className="space-y-4">
            {/* Body Shape Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Target Body Silhouette:
              </label>
              <div className="flex flex-wrap gap-2">
                {BODY_SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => setSelectedShape(shape.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedShape === shape.id
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {shape.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal and Activity dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Wellness / Fitness Goal:
                </label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value as FitnessGoal)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="maintain">Balance & Maintenance</option>
                  <option value="muscle_gain">Muscle Tone & Hypertrophy</option>
                  <option value="fat_loss">Fat Loss & Conditioning</option>
                  <option value="mobility">Posture & Joint Mobility</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Experience / Activity Level:
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="beginner">Beginner (1-2 days / week)</option>
                  <option value="intermediate">Intermediate (3-4 days / week)</option>
                  <option value="advanced">Advanced (5+ days / week)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
            <span className="text-sm">Loading recommendations...</span>
          </div>
        ) : recommendations ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Summary for {recommendations.displayName}
              </span>
              <p className="text-sm text-slate-600 leading-relaxed">
                {recommendations.summary}
              </p>
            </div>

            <RecommendationsTabs recommendations={recommendations} />
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
