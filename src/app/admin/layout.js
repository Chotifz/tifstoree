import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

export const metadata = {
  title: 'Admin Dashboard | TIF Store',
  description: 'TIF Store admin dashboard for managing store data',
};

export default function AdminLayout({ children }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}