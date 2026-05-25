import { headers } from 'next/headers';
import AdminSidebar from './_components/shell/sidebar';

export const metadata = { title: 'Reevo Admin' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already verified admin membership and forwarded identity via headers.
  // Reading from headers avoids a redundant admin_users DB query on every page render.
  const hdrs = await headers();
  const adminEmail = hdrs.get('x-admin-email') ?? '';
  const adminRole  = hdrs.get('x-admin-role')  ?? 'admin';
  const isAdmin    = Boolean(hdrs.get('x-admin-id'));

  // Login and other auth pages render without the shell
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminSidebar adminEmail={adminEmail} adminRole={adminRole}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
