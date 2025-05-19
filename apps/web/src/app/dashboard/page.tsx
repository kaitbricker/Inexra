import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
} 