"use client";

import React from "react";
import { Proportions } from "@/types";
import { Scale, Ruler, Compass, TrendingUp } from "lucide-react";

interface Props {
  proportions: Proportions;
}

export default function ProportionsGrid({ proportions }: Props) {
  const { bmi, bmiCategory, waistHipRatio, shoulderHipRatio, waistBustRatio, bustHipRatio } =
    proportions;

  const cards = [
    {
      title: "Body Mass Index (BMI)",
      value: bmi.toFixed(1),
      unit: "kg/m²",
      badge: bmiCategory,
      badgeColor:
        bmiCategory === "Normal weight"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
      description: "Standard body mass indicator based on height and weight.",
      icon: Scale,
    },
    {
      title: "Waist-to-Hip Ratio (WHR)",
      value: waistHipRatio.toFixed(3),
      unit: "ratio",
      badge: waistHipRatio <= 0.75 ? "Defined Waist" : "Even Proportion",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      description: "Key metric for torso curvature and lower-body contouring.",
      icon: Ruler,
    },
    {
      title: "Shoulder-to-Hip Ratio (SHR)",
      value: shoulderHipRatio.toFixed(3),
      unit: "ratio",
      badge: shoulderHipRatio > 0.45 ? "Broad Shoulders" : "Balanced Frame",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Compares biacromial shoulder breadth against hip width.",
      icon: Compass,
    },
    {
      title: "Waist-to-Bust Ratio (WBR)",
      value: waistBustRatio.toFixed(3),
      unit: "ratio",
      badge: waistBustRatio <= 0.75 ? "Hourglass Taper" : "Balanced Torso",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      description: "Evaluates upper torso taper from bust line to waist.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Key Anthropometric Ratios
      </h3>
      <p className="text-xs text-slate-500 mb-5">
        Biomechanical metrics derived from your measurements that guide ML classification.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-teal-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-600">{card.title}</h4>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">{card.value}</span>
                  <span className="text-xs text-slate-400 font-medium">{card.unit}</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 leading-snug">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
