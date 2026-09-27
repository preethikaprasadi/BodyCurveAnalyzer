"use client";

import React, { useState } from "react";
import { MeasurementRecord } from "@/types";
import { Trash2, Calendar, Award, Loader2 } from "lucide-react";
import { deleteMeasurement } from "@/lib/api";

interface Props {
  records: MeasurementRecord[];
  onRecordDeleted?: () => void;
}

export default function MeasurementHistoryTable({ records, onRecordDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this measurement log?")) return;
    setDeletingId(id);
    try {
      await deleteMeasurement(id);
      if (onRecordDeleted) onRecordDeleted();
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        No measurement history logged yet. Complete an analysis to record your baseline!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-900">Recorded Measurement Logs</h3>
        <span className="text-xs font-medium text-slate-500">{records.length} total entries</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Shape</th>
              <th className="py-3 px-4">Weight</th>
              <th className="py-3 px-4">Waist</th>
              <th className="py-3 px-4">Hip</th>
              <th className="py-3 px-4">WHR</th>
              <th className="py-3 px-4">Bust</th>
              <th className="py-3 px-4">Shoulder</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {r.date}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-teal-50 text-teal-800 border border-teal-200">
                    {r.bodyShape.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800">{r.weight} kg</td>
                <td className="py-3 px-4 text-slate-700">{r.waist} cm</td>
                <td className="py-3 px-4 text-slate-700">{r.hip} cm</td>
                <td className="py-3 px-4 font-bold text-teal-700">
                  {r.waistHipRatio ? r.waistHipRatio.toFixed(3) : (r.waist / r.hip).toFixed(3)}
                </td>
                <td className="py-3 px-4 text-slate-600">{r.bust} cm</td>
                <td className="py-3 px-4 text-slate-600">{r.shoulder} cm</td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete log"
                  >
                    {deletingId === r.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
