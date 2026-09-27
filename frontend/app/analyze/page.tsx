import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MeasurementForm from "@/components/MeasurementForm";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function AnalyzePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Assessment
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Body Proportion Analysis
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your circumferences below. Our machine-learning pipeline extracts anatomical ratios and identifies your body-shape category.
          </p>
        </div>

        {/* Form */}
        <MeasurementForm />

        {/* Security / Privacy notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Data processed locally. Zero image capture or invasive scanning required.</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
