"use client";

import React, { useState } from "react";
import { RecommendationsData } from "@/types";
import {
  Dumbbell,
  Heart,
  Shirt,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  Layers,
} from "lucide-react";

interface Props {
  recommendations: RecommendationsData;
}

export default function RecommendationsTabs({ recommendations }: Props) {
  const [activeTab, setActiveTab] = useState<"fitness" | "wellness" | "fashion">("fitness");

  const { fitness, wellness, fashion, goalCustomization, activityCustomization } = recommendations;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-2 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("fitness")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "fitness"
              ? "bg-white text-teal-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Dumbbell className="w-4 h-4 text-teal-600" />
          <span>Fitness Guidance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("wellness")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "wellness"
              ? "bg-white text-teal-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Wellness & Habits</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fashion")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "fashion"
              ? "bg-white text-teal-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Shirt className="w-4 h-4 text-indigo-500" />
          <span>Fashion & Style</span>
        </button>
      </div>

      {/* Goal Customization Callout */}
      {goalCustomization && (
        <div className="bg-teal-50/50 border-b border-teal-100/80 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-teal-900 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {goalCustomization.title}
            </span>
            <span>{goalCustomization.guidance}</span>
          </div>
          {activityCustomization && (
            <div className="font-semibold text-teal-700 shrink-0">
              {activityCustomization.frequency} ({activityCustomization.selectedLevel})
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6 sm:p-8">
        {/* Fitness Tab */}
        {activeTab === "fitness" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Biomechanical Training Focus
              </h4>
              <p className="text-base text-slate-800 font-medium">{fitness.focus}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Key Recommended Resistance Movements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fitness.exercises.map((exercise, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 font-medium">{exercise}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Cardiovascular Strategy
                </h5>
                <p className="text-sm text-slate-700">{fitness.cardio}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Suggested Weekly Cadence
                </h5>
                <p className="text-sm text-slate-700">{fitness.weeklyStructure}</p>
              </div>
            </div>
          </div>
        )}

        {/* Wellness Tab */}
        {activeTab === "wellness" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Non-Medical Nutritional Principles
              </h4>
              <div className="space-y-2.5">
                {wellness.nutritionTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Posture & Ergonomic Cues
                </h5>
                <ul className="space-y-2 text-sm text-slate-700">
                  {wellness.postureTips.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Rest & Musculoskeletal Recovery
                </h5>
                <p className="text-sm text-slate-700">{wellness.recovery}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fashion Tab */}
        {activeTab === "fashion" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
                  Flattering Tops
                </h5>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {fashion.tops.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-600">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
                  Recommended Bottoms
                </h5>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {fashion.bottoms.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-600">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
                  Dress Silhouettes
                </h5>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {fashion.dresses.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-600">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
                  Jackets & Outerwear
                </h5>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {fashion.outerwear.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-600">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Styling Principles & Optical Lines
                </h5>
                <ul className="space-y-1.5 text-xs text-emerald-950">
                  {fashion.stylingTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Cuts That Disrupt Natural Proportions
                </h5>
                <ul className="space-y-1.5 text-xs text-rose-950">
                  {fashion.avoid.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
