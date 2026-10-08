"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressChart from "@/components/ProgressChart";
import { MeasurementRecord, ProgressData } from "@/types";
import { fetchMeasurements, fetchProgress } from "@/lib/api";
import {
  Activity,
  PlusCircle,
  TrendingUp,
  Ruler,
  Scale,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    try {
      const targetUserId = user ? user.id : "guest";
      const [records, prog] = await Promise.all([
        fetchMeasurements(targetUserId, 5),
        fetchProgress(targetUserId),
      ]);
      setMeasurements(records);
      setProgress(prog);
    } catch (e) {
      console.warn("Could not load dashboard data from backend", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const latest = measurements.length > 0 ? measurements[0] : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" />
              User Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Body Proportion Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your anatomical metrics, latest body shape, and progress timeline.
            </p>
          </div>

          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-colors self-start sm:self-center"
          >
            <PlusCircle className="w-4 h-4" />
            New Assessment
          </Link>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
            <span className="text-sm">Loading dashboard data...</span>
          </div>
        ) : !latest ? (
          /* Empty State */
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Welcome to BodyCurve Analyzer</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              You haven&apos;t logged any body measurements yet. Perform your first quick analysis to establish your baseline body shape and start tracking progress.
            </p>
            <div className="mt-6">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                Log Your First Measurement
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Shape Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider block mb-1">
                    Current Silhouette
                  </span>
                  <div className="text-2xl font-extrabold capitalize">
                    {latest.bodyShape.replace("_", " ")}
                  </div>
                  <span className="text-xs text-teal-100 mt-1 block">
                    Confidence: {Math.round(latest.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-teal-500/40 text-[11px] text-teal-100 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Assessed on {latest.date}
                </div>
              </div>

              {/* Weight Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Current Mass
                    </span>
                    <Scale className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{latest.weight} kg</div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    BMI: {latest.bmi || (latest.weight / ((latest.height / 100) ** 2)).toFixed(1)}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Height: {latest.height} cm
                </div>
              </div>

              {/* Waist-to-Hip Ratio */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Waist-to-Hip (WHR)
                    </span>
                    <Ruler className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {(latest.waist / latest.hip).toFixed(3)}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Waist: {latest.waist}cm | Hip: {latest.hip}cm
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Curvature Ratio
                </div>
              </div>

              {/* Upper Torso Balance */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Upper Torso Balance
                    </span>
                    <Award className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {(latest.shoulder / latest.hip).toFixed(3)}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Shoulder: {latest.shoulder}cm | Bust: {latest.bust}cm
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Shoulder-to-Hip Index
                </div>
              </div>
            </div>

            {/* Progress Chart Preview */}
            {progress && progress.timeline.length > 0 && (
              <ProgressChart timeline={progress.timeline} />
            )}

            {/* Quick Actions & Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link
                href="/progress"
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">View Full Progress</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Inspect your complete measurement log history and delete or export entries.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Progress Page →
                </span>
              </Link>

              <Link
                href="/recommendations"
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Style & Fitness Guide</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Explore curated fashion silhouettes, nutrition cues, and targeted exercise routines.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore Recommendations →
                </span>
              </Link>

              <Link
                href="/analyze"
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Log New Measurements</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Update your numbers to see how your waist, hips, and body shape classifications evolve.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Start New Entry →
                </span>
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
