"use client";

type SupabaseErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
};

export default function SupabaseErrorModal({ isOpen, onClose, onRetry }: SupabaseErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-50 mb-2 [html[data-theme='light']_&]:text-slate-900">
              Temporary Connection Issue
            </h3>
            <p className="text-sm text-slate-300 mb-4 [html[data-theme='light']_&]:text-slate-700">
              We&apos;re having trouble connecting to our services.
            </p>
            
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4 [html[data-theme='light']_&]:bg-slate-100">
              <p className="text-sm text-slate-300 mb-2 [html[data-theme='light']_&]:text-slate-700">
                <strong className="text-slate-100 [html[data-theme='light']_&]:text-slate-900">Suggested solutions:</strong>
              </p>
              <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside [html[data-theme='light']_&]:text-slate-600">
                <li>Check your internet connection</li>
                <li>Try using a VPN service</li>
                <li>Try again in a few moments</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onRetry}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition [html[data-theme='light']_&]:bg-blue-600 [html[data-theme='light']_&]:text-white [html[data-theme='light']_&]:hover:bg-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Connection
              </button>
              
              <div className="flex gap-2">
                <a
                  href="https://status.supabase.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-slate-100 text-sm font-medium hover:bg-slate-600 transition [html[data-theme='light']_&]:bg-slate-200 [html[data-theme='light']_&]:text-slate-900 [html[data-theme='light']_&]:hover:bg-slate-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Service Status
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-600 text-slate-100 text-sm font-medium hover:bg-slate-500 transition [html[data-theme='light']_&]:bg-slate-300 [html[data-theme='light']_&]:text-slate-900 [html[data-theme='light']_&]:hover:bg-slate-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
