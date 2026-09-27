import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-lg">
                BodyCurve <span className="text-teal-600">Analyzer</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              AI/ML-assisted body proportion analysis and personalized wellness platform.
              Built with Next.js, Flask, and Scikit-learn.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/analyze" className="hover:text-teal-600 transition-colors">
                  Measurement Assessment
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-teal-600 transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-teal-600 transition-colors">
                  Progress Tracking
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="hover:text-teal-600 transition-colors">
                  Fitness & Fashion Guide
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Educational & Non-Medical Tool
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              This application categorizes geometric body proportions for educational, wellness, and styling
              purposes. It does not constitute medical diagnosis, clinical evaluation, or dietary prescription.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BodyCurve Analyzer. Full-stack AI/ML Portfolio Project.</p>
          <p className="mt-2 sm:mt-0">Lightweight Architecture · CPU-Optimized Inference</p>
        </div>
      </div>
    </footer>
  );
}
