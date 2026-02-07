import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner - Simple loading animation component
 * Used as fallback for React.lazy Suspense boundaries
 */
export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <Loader2 size={48} className="text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
