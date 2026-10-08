"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressChart from "@/components/ProgressChart";
import MeasurementHistoryTable from "@/components/MeasurementHistoryTable";
import { MeasurementRecord, ProgressData } from "@/types";
import { fetchMeasurements, fetchProgress } from "@/lib/api";
import { BarChart2, PlusCircle, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProgressPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MeasurementRecord[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const targetUserId = user ? user.id : "guest";
      const [fetchedRecords, fetchedProgress] = await Promise.all([
        fetchMeasurements(targetUserId, 100),
        fetchProgress(targetUserId),
      ]);
      setRecords(fetchedRecords);
      setProgress(fetchedProgress);
    } catch (e) {
      console.warn("Failed to fetch progress data", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <BarChart2 className="w-3.5 h-3.5" />
              Progress Tracking
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Measurement History & Trends
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Visualize your mass and anatomical ratio progression over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Log Measurement
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
            <span className="text-sm">Loading historical data...</span>
          </div>
        ) : (
          <>
            {/* 1. Time-series Line Chart */}
            <ProgressChart timeline={progress ? progress.timeline : []} />

            {/* 2. Detailed History Table */}
            <MeasurementHistoryTable records={records} onRecordDeleted={loadData} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
