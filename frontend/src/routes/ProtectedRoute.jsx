export default function ProtectedRoute({ children }) {
  // Always render children during preview mode
  return children;
}
