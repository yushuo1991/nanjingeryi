import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RehabCareLink from './RehabCareLink'
import { AuthProvider, PatientProvider, UIProvider } from './contexts'

// 404 Not Found Page Component
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-300 mb-8">Page not found</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider defaultRole="therapist">
        <UIProvider defaultPage="home">
          <PatientProvider onError={(error) => console.error('Patient error:', error)}>
            <Routes>
              {/* Main application routes */}
              <Route path="/" element={<RehabCareLink />} />
              <Route path="/patients" element={<RehabCareLink />} />
              <Route path="/patients/:id" element={<RehabCareLink />} />
              <Route path="/profile" element={<RehabCareLink />} />

              {/* 404 Not Found */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </PatientProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
