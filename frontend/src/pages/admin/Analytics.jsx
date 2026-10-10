
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ORDER_KEY = "kirana_admin_orders";
const DATA_KEY = "kirana_admin_data";
const PRODUCTS_KEY = "kirana_admin_products";

const demoSales = [
  { date: "Mon", sales: 4200, customers: 8 },
  { date: "Tue", sales: 6100, customers: 12 },
  { date: "Wed", sales: 5300, customers: 10 },
  { date: "Thu", sales: 7800, customers: 16 },
  { date: "Fri", sales: 6900, customers: 14 },
  { date: "Sat", sales: 9200, customers: 21 },
  { date: "Sun", sales: 8500, customers: 18 },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.orders)) return value.orders;
  if (Array.isArray(value?.customers)) return value.customers;
  if (Array.isArray(value?.vendors)) return value.vendors;
  if (Array.isArray(value?.products)) return value.products;
  return [];
}

function getAmount(order) {
  return Number(
    order.totalAmount ??
    order.total ??
    order.amount ??
    order.grandTotal ??
    0
  );
}

function getDate(value) {
  const raw = value?.createdAt ?? value?.created_at ?? value?.date;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function StatCard({ title, value, detail }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      <div className="mt-5 h-72 w-full">{children}</div>
    </section>
  );
}

export default function Analytics() {
  const adminData = useMemo(
    () => readStorage(DATA_KEY, {}),
    []
  );

  const orders = useMemo(
    () => getArray(readStorage(ORDER_KEY, [])),
    []
  );

  const customers = useMemo(
    () => getArray(adminData.customers ?? []),
    [adminData]
  );

  const vendors = useMemo(
    () => getArray(adminData.vendors ?? []),
    [adminData]
  );

  const products = useMemo(
    () => getArray(readStorage(PRODUCTS_KEY, [])),
    []
  );

  const hasOrderData = orders.length > 0;

  const salesData = useMemo(() => {
    if (!hasOrderData) return demoSales;

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);

      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = orders.filter((order) => {
        const date = getDate(order);
        return date && date >= day && date < nextDay;
      });

      days.push({
        date: day.toLocaleDateString("en-US", { weekday: "short" }),
        sales: dayOrders.reduce((sum, order) => sum + getAmount(order), 0),
        customers: dayOrders.length,
      });
    }

    return days;
  }, [orders, hasOrderData]);

  const vendorData = useMemo(() => {
    const totals = new Map();

    orders.forEach((order) => {
      const name =
        order.vendorName ??
        order.vendor_name ??
        order.vendor?.name ??
        "Other vendors";

      totals.set(name, (totals.get(name) ?? 0) + getAmount(order));
    });

    const actual = [...totals.entries()]
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    if (actual.length) return actual;

    return vendors.slice(0, 5).map((vendor, index) => ({
      name: vendor.name ?? vendor.businessName ?? `Vendor ${index + 1}`,
      sales: Number(vendor.sales ?? vendor.totalSales ?? 0),
    }));
  }, [orders, vendors]);

  const productData = useMemo(() => {
    const totals = new Map();

    orders.forEach((order) => {
      const items = Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.products)
        ? order.products
        : [];

      items.forEach((item) => {
        const name = item.name ?? item.productName ?? "Unknown product";
        const quantity = Number(item.quantity ?? item.qty ?? 1);
        totals.set(name, (totals.get(name) ?? 0) + quantity);
      });
    });

    const actual = [...totals.entries()]
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    if (actual.length) return actual;

    return products.slice(0, 5).map((product, index) => ({
      name: product.name ?? `Product ${index + 1}`,
      units: Number(product.sold ?? product.quantitySold ?? 0),
    }));
  }, [orders, products]);

  const customerData = useMemo(() => {
    const dates = new Map();

    customers.forEach((customer) => {
      const date = getDate(customer);
      if (!date) return;

      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      dates.set(label, (dates.get(label) ?? 0) + 1);
    });

    const actual = [...dates.entries()]
      .map(([date, customers]) => ({ date, customers }))
      .slice(-7);

    return actual.length ? actual : demoSales.map(({ date, customers }) => ({
      date,
      customers,
    }));
  }, [customers]);

  const totalSales = hasOrderData
    ? orders.reduce((sum, order) => sum + getAmount(order), 0)
    : demoSales.reduce((sum, day) => sum + day.sales, 0);

  const totalOrders = hasOrderData ? orders.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track sales, vendor performance, popular products and customer growth.
        </p>
        <p className="mt-2 text-xs text-amber-700">
          {hasOrderData
            ? "Sales charts use the orders currently saved in this browser."
            : "Demo sales are displayed because no admin orders were found in localStorage."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`₹${totalSales.toLocaleString("en-IN")}`}
          detail={hasOrderData ? "From saved orders" : "Demo data"}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString("en-IN")}
          detail={hasOrderData ? "Saved orders" : "No saved orders found"}
        />
        <StatCard
          title="Customers"
          value={customers.length.toLocaleString("en-IN")}
          detail="Customers in admin data"
        />
        <StatCard
          title="Vendors"
          value={vendors.length.toLocaleString("en-IN")}
          detail="Vendors in admin data"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="Sales Over Time"
          subtitle="Daily sales for the last seven days"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Sales",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Customer Growth"
          subtitle="Customer registrations by date"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="customers"
                name="New customers"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top Vendors"
          subtitle="Ranked by sales value when order data is available"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendorData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" name="Sales (₹)" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
          {!vendorData.length && (
            <p className="text-sm text-gray-500">No vendor data available yet.</p>
          )}
        </ChartCard>

        <ChartCard
          title="Top Products"
          subtitle="Ranked by quantity sold when order items are available"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="units" name="Units sold" fill="#ea580c" />
            </BarChart>
          </ResponsiveContainer>
          {!productData.length && (
            <p className="text-sm text-gray-500">No product data available yet.</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
