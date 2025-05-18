'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/Spinner';
import { GetServerSideProps } from 'next';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  content: string;
  url: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

// Dynamically import the FeedbackList component with SSR disabled
const FeedbackList = dynamic(
  () => import('@/components/feedback/FeedbackList').then(mod => mod.FeedbackList),
  {
    ssr: false,
    loading: () => <Spinner />
  }
);

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}
  };
};

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/');
      showToast('You do not have permission to access this page', 'error');
      return;
    }

    const fetchFeedback = async () => {
      try {
        const response = await fetch('/api/feedback');
        if (!response.ok) throw new Error('Failed to fetch feedback');
        const data = await response.json();
        setFeedback(data);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        showToast('Error loading feedback', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [session, status, router, showToast]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setFeedback(prev => prev.map(item => (item.id === id ? { ...item, status } : item)));
      showToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error updating status', 'error');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Feedback Management</h1>
      <FeedbackList feedback={feedback} onStatusChange={handleStatusChange} />
    </div>
  );
}
