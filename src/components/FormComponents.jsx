import React from 'react';

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 ${props.className || ''}`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 ${props.className || ''}`}
    />
  );
}
