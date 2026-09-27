"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { ProgressTimelinePoint } from "@/types";
import { TrendingUp, Scale, Ruler } from "lucide-react";

interface Props {
  timeline: ProgressTimelinePoint[];
}

export default function ProgressChart({ timeline }: Props) {
  const [metricView, setMetricView] = useState<"weight_waist" | "whr">("weight_waist");

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Measurement History Recorded</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Save multiple assessments over time to visualize your weight, waist, and hip trends on this interactive chart.
        </p>
      </div>
    );
  }

  // Format data for recharts
  const chartData = timeline.map((pt) => ({
    date: pt.date,
    Weight: pt.weight,
    Waist: pt.waist,
    Hip: pt.hip,
    Bust: pt.bust,
    WHR: pt.waistHipRatio,
    Shape: pt.bodyShape,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Measurement Progress Over Time
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracking {timeline.length} recorded assessment{timeline.length > 1 ? "s" : ""}.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setMetricView("weight_waist")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              metricView === "weight_waist"
                ? "bg-white text-teal-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Weight & Waist (kg/cm)
          </button>
          <button
            type="button"
            onClick={() => setMetricView("whr")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              metricView === "whr"
                ? "bg-white text-teal-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Waist-Hip Ratio (WHR)
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricView === "weight_waist" ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="Weight"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0d9488" }}
                activeDot={{ r: 6 }}
                name="Weight (kg)"
              />
              <Line
                type="monotone"
                dataKey="Waist"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: "#6366f1" }}
                name="Waist (cm)"
              />
              <Line
                type="monotone"
                dataKey="Hip"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#f43f5e" }}
                name="Hip (cm)"
              />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                domain={[0.6, 1.1]}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="WHR"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#0d9488" }}
                name="Waist-to-Hip Ratio"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
