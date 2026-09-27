"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BodyShapeCard from "@/components/BodyShapeCard";
import ProportionsGrid from "@/components/ProportionsGrid";
import RecommendationsTabs from "@/components/RecommendationsTabs";
import { AnalyzeResponse } from "@/types";
import { Sparkles, ArrowLeft, BarChart2, Activity, RefreshCw } from "lucide-react";

export default function ResultsPage() {
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("bodycurve_latest_analysis");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setAnalysisData(parsed);
        } catch (e) {
          console.error("Failed to parse cached analysis", e);
        }
      }
    }
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full space-y-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Analysis Complete
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Personalized Assessment
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Evaluated by Scikit-learn inference pipeline using anthropometric proportion heuristics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-Analyze
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              View Progress
            </Link>
          </div>
        </div>

        {/* Loading / Empty fallback */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            Loading assessment results...
          </div>
        ) : !analysisData ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">No Assessment Found in Session</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You haven't run a measurement analysis yet. Enter your measurements on the analysis page to view your classification.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors"
            >
              Go to Measurement Form
            </Link>
          </div>
        ) : (
          <>
            {/* 1. Body Shape Classification Badge */}
            <BodyShapeCard analysis={analysisData.analysis} />

            {/* 2. Key Anthropometric Ratios */}
            <ProportionsGrid proportions={analysisData.analysis.proportions} />

            {/* 3. Tailored Recommendations */}
            <RecommendationsTabs recommendations={analysisData.recommendations} />

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 text-sm">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:text-teal-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Analyze Different Measurements
              </Link>
              <div className="flex gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Activity className="w-4 h-4 text-teal-600" />
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
