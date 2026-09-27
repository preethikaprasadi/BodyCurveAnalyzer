"use client";

import React from "react";
import { AnalysisResult } from "@/types";
import { CheckCircle2, Info, Sparkles, Award } from "lucide-react";

interface Props {
  analysis: AnalysisResult;
}

export default function BodyShapeCard({ analysis }: Props) {
  const { displayName, bodyShape, description, confidence, probabilities, modelUsed } = analysis;

  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-teal-100/60 to-transparent pointer-events-none -mr-16 -mt-16 rounded-full" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" />
            ML Classification Result
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {displayName}
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-xl leading-relaxed">
            {description}
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
            <span>Inference Model: <strong className="text-slate-600 font-semibold">{modelUsed}</strong></span>
            <span>•</span>
            <span>Input Proportions Evaluated</span>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex flex-col items-center sm:items-end justify-center bg-slate-50 p-5 rounded-2xl border border-slate-100 min-w-[200px]">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Model Confidence
          </span>
          <div className="text-4xl font-black text-teal-600 mt-1">
            {confidencePercent}%
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Softmax calibrated probability
          </span>
        </div>
      </div>

      {/* Class Probabilities Distribution */}
      {probabilities && Object.keys(probabilities).length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Full Classification Probability Distribution:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {Object.entries(probabilities).map(([cls, prob]) => {
              const isSelected = cls.toLowerCase() === bodyShape.toLowerCase();
              const pct = Math.round(prob * 100);
              return (
                <div
                  key={cls}
                  className={`p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-teal-50/70 border-teal-300 text-teal-900 font-semibold"
                      : "bg-slate-50/60 border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="capitalize">{cls.replace("_", " ")}</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isSelected ? "bg-teal-600" : "bg-slate-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
