import { useNavigate, useParams, useLocation } from 'react-router-dom';

/**
 * Custom hook that encapsulates React Router navigation functionality
 * Provides type-safe navigation functions for the application
 */
export function useNavigation() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  return {
    // Navigation functions
    goToHome: () => navigate('/'),
    goToPatients: () => navigate('/patients'),
    goToPatientDetail: (patientId) => navigate(`/patients/${patientId}`),
    goToProfile: () => navigate('/profile'),
    goBack: () => navigate(-1),
    goForward: () => navigate(1),

    // Generic navigation
    navigateTo: (path) => navigate(path),

    // URL parameters
    params,

    // Current location info
    location,
    pathname: location.pathname,

    // Helper to check current route
    isRoute: (path) => location.pathname === path,
    isRouteMatch: (pattern) => {
      const regex = new RegExp(pattern.replace(/:\w+/g, '[^/]+'));
      return regex.test(location.pathname);
    }
  };
}

export default useNavigation;
