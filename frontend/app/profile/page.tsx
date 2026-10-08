"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { FitnessGoal, ActivityLevel } from "@/types";
import { User, CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    ageRange: "25-34",
    gender: "female",
    goal: "maintain" as FitnessGoal,
    activityLevel: "beginner" as ActivityLevel,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setFormData({
        name: user.name || "",
        ageRange: user.ageRange || "25-34",
        gender: user.gender || "female",
        goal: (user.goal as FitnessGoal) || "maintain",
        activityLevel: (user.activityLevel as ActivityLevel) || "beginner",
      });
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12 w-full my-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Profile & Goals
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal details, wellness targets, and activity cadence.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {success && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Email
              </label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Email address cannot be changed.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Age Range
                </label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                >
                  <option value="18-24">18–24</option>
                  <option value="25-34">25–34</option>
                  <option value="35-44">35–44</option>
                  <option value="45-54">45–54</option>
                  <option value="55+">55+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Gender / Silhouette
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="unspecified">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Fitness & Wellness Goal
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value as FitnessGoal })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                >
                  <option value="maintain">Balance & Maintenance</option>
                  <option value="muscle_gain">Muscle Tone & Hypertrophy</option>
                  <option value="fat_loss">Fat Loss & Conditioning</option>
                  <option value="mobility">Posture & Mobility</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Activity Cadence
                </label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                >
                  <option value="beginner">Beginner (1-2 days / week)</option>
                  <option value="intermediate">Intermediate (3-4 days / week)</option>
                  <option value="advanced">Advanced (5+ days / week)</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
