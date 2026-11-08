import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageLoader from './Spinner.jsx';

export default function ProtectedRoute({ children, staff = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (staff && !['ADMIN', 'STAFF'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
