import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withSecurity } from '@/middleware/security';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['new', 'in-progress', 'resolved', 'closed']),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const validatedData = updateSchema.parse(req.body);

    const feedback = await db.getWriteClient().feedback.update({
      where: { id: id as string },
      data: { status: validatedData.status },
    });

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid status data' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withSecurity(handler); 