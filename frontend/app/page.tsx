import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  Activity,
  Ruler,
  TrendingUp,
  Shirt,
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-teal-50/50 via-white to-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              Machine Learning-Assisted Body Proportion Analysis
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Understand Your Silhouette.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
                Tailor Your Wellness.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Move beyond generic fitness advice and unflattering off-the-rack fashion.
              Input your anatomical measurements to receive instant ML-based classification,
              biomechanical ratios, and tailored wellness guidance.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/analyze"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-sm hover:shadow transition-all"
              >
                Start Free Analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base border border-slate-200 shadow-2xs transition-all"
              >
                View Dashboard
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-slate-900">5</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Body Shapes Classified</div>
              </div>
              <div>
                <div className="text-2xl font-black text-teal-600">&lt; 10ms</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Inference Latency</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">100%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Rule-Grounded ML</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">Zero-Daemon</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Lightweight & Fast</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Flow */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600">
              How BodyCurve Works
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              From Tape Measurement to Actionable Insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Input Measurements</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide height, weight, shoulder width, bust, natural waist, and hip circumferences in centimeters.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Feature Engineering</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Computes anthropometric indices including BMI, Waist-to-Hip Ratio (WHR), and Shoulder-to-Hip Ratio (SHR).
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">ML Classification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A Scikit-learn tabular model classifies your silhouette into one of five anatomical categories with confidence scoring.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold text-lg flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tailored Guidance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access customized resistance training routines, posture tips, and fashion styling principles that flatter your frame.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Biomechanic Fitness</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Exercises designed around muscle balance — whether developing shoulder breadth for Pear shapes or posterior chain hypertrophy for Rectangles.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Shirt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Flattering Fashion Lines</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Silhouettes for tops, bottoms, dresses, and layering that work harmoniously with your natural anatomical proportions.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Visual Progress Charts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track how resistance training and wellness consistency shift your circumferences and WHR over months with interactive charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Discover Your Body Proportions?
          </h2>
          <p className="mt-4 text-teal-100 max-w-xl mx-auto text-base">
            Takes less than 60 seconds with a measuring tape. No photos or camera required.
          </p>
          <div className="mt-8">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-all shadow-md"
            >
              Start Analysis Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
