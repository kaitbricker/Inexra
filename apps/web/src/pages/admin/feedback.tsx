import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FeedbackList } from '@/components/feedback/FeedbackList';
import { useToast } from '@/hooks/useToast';

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

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/');
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
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [session, router, showToast]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );

      showToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error updating status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">User Feedback Management</h1>
      <FeedbackList
        feedback={feedback}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
} 