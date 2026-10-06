import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const session = localStorage.getItem("kirana_admin_session");

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;