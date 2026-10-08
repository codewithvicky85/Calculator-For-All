/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, PlayCircle, CheckCircle2, ExternalLink, Copy, Check, ShieldCheck, Terminal, Smartphone } from 'lucide-react';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishGuideModal: React.FC<PublishGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const bubblewrapCommand = `npm install -g @bubblewrap/cli\nbubblewrap init --manifest=https://your-domain.com/manifest.json\nbubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Publishing "CalculatorForAll" on Google Play Store
              </h3>
              <p className="text-xs text-slate-400">
                Official Google Trusted Web Activity (TWA) & PWA packaging workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Readiness Status */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>PWA Standards Configured</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              CalculatorForAll already includes a compliant <code className="text-emerald-300 bg-emerald-950/40 px-1 py-0.5 rounded font-mono">manifest.json</code>, responsive SVG icons, mobile viewport tags, standalone display mode, and zero external dependencies. You can package it as a native Android app without rewriting code!
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              3-Step Release Process
            </h4>

            {/* Step 1 */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span className="font-semibold text-slate-200">
                  Method A (Fastest, No Code): Use PWABuilder (Recommended by Google)
                </span>
              </div>
              <p className="text-slate-400 pl-7 leading-relaxed">
                PWABuilder is Microsoft and Google's official open-source tool to turn PWAs into Google Play Store packages (<code className="text-cyan-300 font-mono">.aab</code> Android App Bundles):
              </p>
              <ol className="list-decimal list-inside pl-7 space-y-1 text-slate-300">
                <li>Go to <strong className="text-cyan-400">PWABuilder.com</strong></li>
                <li>Enter your published application URL</li>
                <li>Click <strong className="text-slate-100">Package for Stores</strong> → Choose <strong className="text-emerald-400">Google Play (Android)</strong></li>
                <li>Fill in Package ID (e.g. <code className="text-cyan-300 font-mono">com.calculatorforall.app</code>), version (1.0.0), and download the signed <code className="text-slate-200 font-mono">.aab</code> bundle and <code className="text-slate-200 font-mono">assetlinks.json</code>.</li>
              </ol>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span className="font-semibold text-slate-200">
                  Method B (Developer CLI): Use Google Bubblewrap
                </span>
              </div>
              <p className="text-slate-400 pl-7 leading-relaxed">
                Google's official CLI tool directly generates a native Android Studio project using Trusted Web Activity (TWA):
              </p>
              <div className="ml-7 p-3 bg-slate-900 rounded-lg border border-slate-850 font-mono text-[11px] relative">
                <pre className="text-slate-300 overflow-x-auto">{bubblewrapCommand}</pre>
                <button
                  onClick={() => copyCode(bubblewrapCommand, 'cmd')}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
                >
                  {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span className="font-semibold text-slate-200">
                  Submit to Google Play Console
                </span>
              </div>
              <ol className="list-decimal list-inside pl-7 space-y-1 text-slate-300">
                <li>Register a Google Play Developer Account at <strong className="text-cyan-400">play.google.com/console</strong> ($25 one-time registration fee).</li>
                <li>Click <strong className="text-slate-100">Create App</strong> → Title: <strong className="text-cyan-300">CalculatorForAll</strong>.</li>
                <li>Fill out App Listing: Short Description, Screenshots (can be captured from the responsive web app), Privacy Policy.</li>
                <li>Under <strong className="text-slate-100">Release &gt; Production</strong>, upload the downloaded <code className="text-cyan-300 font-mono">.aab</code> package.</li>
                <li>Submit for review. Google reviews and publishes apps usually in 1 to 3 days!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            CalculatorForAll is ready for Android TWA submission
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
