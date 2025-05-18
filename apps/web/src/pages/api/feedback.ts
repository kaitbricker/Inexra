import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withSecurity } from '@/middleware/security';
import { db } from '@/lib/db';
import { captureMessage } from '@/lib/sentry';
import { z } from 'zod';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  feedback: z.string().min(1).max(1000),
  url: z.string().url(),
  userAgent: z.string(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const validatedData = feedbackSchema.parse(req.body);

    // Store feedback in database
    await db.getWriteClient().feedback.create({
      data: {
        type: validatedData.type,
        content: validatedData.feedback,
        url: validatedData.url,
        userAgent: validatedData.userAgent,
        userId: session.user.id,
      },
    });

    // Log feedback submission
    captureMessage('Feedback submitted', {
      type: validatedData.type,
      url: validatedData.url,
      userId: session.user.id,
    });

    // Send notification to team (implement your notification system)
    // await notifyTeam(validatedData);

    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error handling feedback:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid feedback data' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withSecurity(handler);
