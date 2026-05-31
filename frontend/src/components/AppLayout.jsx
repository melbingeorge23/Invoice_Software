import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  Package,
  LogOut,
  ReceiptText,
  Building2,
  BarChart3,
  ClipboardList,
  UserCog
} from "lucide-react";

function AppLayout({
  currentUser,
  activePage,
  setActivePage,
  onLogout,
  children
}) {
  const isAdmin = currentUser?.role === "ADMIN";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      allowed: true
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      allowed: true
    },
    {
  id: "customer-statement",
  label: "Customer Statement",
  icon: ClipboardList,
  allowed: true
},
    {
      id: "create-invoice",
      label: "Create Invoice",
      icon: FilePlus,
      allowed: true
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      allowed: true
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      allowed: isAdmin
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      allowed: isAdmin
    },
    {
        id: "company-profile",
        label: "Company Profile",
        icon: Building2,
        allowed: isAdmin
    },
    {
  id: "user-management",
  label: "User Management",
  icon: UserCog,
  allowed: isAdmin
}
  ];

  return (
    <div className="premium-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ReceiptText size={26} />
          </div>

          <div>
            <h2>InvoicePro</h2>
            <p>Billing Suite</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems
            .filter((item) => item.allowed)
            .map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  className={activePage === item.id ? "menu-item active" : "menu-item"}
                  onClick={() => setActivePage(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {currentUser?.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="user-info">
            <strong>{currentUser?.name}</strong>
            <span>{currentUser?.role}</span>
          </div>
        </div>
      </aside>

      <section className="main-shell">
        <header className="topbar">
          <div>
            <h1>
              {activePage === "dashboard" && "Dashboard"}
              {activePage === "reports" && "Reports"}
              {activePage === "customer-statement" && "Customer Statement"}
              {activePage === "create-invoice" && "Create Invoice"}
              {activePage === "invoices" && "Invoice Management"}
              {activePage === "customers" && "Customer Master"}
              {activePage === "products" && "Product Master"}
              {activePage === "company-profile" && "Company Profile"}
              {activePage === "user-management" && "User Management"}
            </h1>

            <p>
              Manage billing, customers, products, reports, and invoices.
            </p>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </header>

        <div className="content-area">{children}</div>
      </section>
    </div>
  );
}

export default AppLayout;