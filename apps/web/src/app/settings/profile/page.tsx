import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ProfileForm } from '@/components/settings/ProfileForm';

const prisma = new PrismaClient();

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      profileImage: true,
    },
  });

  console.log('User fetched:', user);

  if (!user) {
    console.error('User not found for ID:', session.user.id);
    redirect('/auth/signin');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <ProfileForm user={user} />
    </div>
  );
}
