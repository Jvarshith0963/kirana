import { NavLink, Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "📊",
      end: true,
    },
    {
      name: "Customers",
      path: "/admin/customers",
      icon: "👥",
    },
    {
      name: "Vendors",
      path: "/admin/vendors",
      icon: "🏪",
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: "📂",
    },
    {
      name: "Brands",
      path: "/admin/brands",
      icon: "🏷️",
    },
    {
      name: "Vendor Approvals",
      path: "/admin/vendor-approvals",
      icon: "✅",
    },
    {
      name: "Coupons",
      path: "/admin/coupons",
      icon: "🎟️",
    },
    {
      name: "Banners & Offers",
      path: "/admin/banners",
      icon: "🖼️",
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: "📈",
    },
    {
      name: "Returns & Refunds",
      path: "/admin/returns",
      icon: "💰",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("kirana_admin_session");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-slate-950 text-white">
        {/* Logo */}
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500 text-xl">
              🛡️
            </div>

            <div>
              <h1 className="font-bold">
                Kirana Admin
              </h1>

              <p className="text-xs text-slate-400">
                Control Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Management
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="text-lg">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 rounded-xl bg-slate-900 p-3">
            <p className="text-xs text-slate-500">
              Signed in as
            </p>

            <p className="mt-1 font-semibold">
              Administrator
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 min-h-screen flex-1">
        {/* TOP HEADER */}
        <div className="border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                Admin Panel
              </p>

              <h2 className="text-xl font-bold text-gray-800">
                Kirana Marketplace Management
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              🛡️
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;