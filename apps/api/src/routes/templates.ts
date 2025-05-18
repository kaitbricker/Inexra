import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { WebSocketService } from '../services/websocket';
import { TemplateService } from '../services/templateService';

const router = Router();
const templateService = new TemplateService(prisma);

// Template validation schemas
const templateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  category: z.enum(['sales', 'support', 'collaboration', 'custom']),
  keywords: z.array(z.string().min(1).max(50)),
  variables: z.record(z.object({
    type: z.string(),
    required: z.boolean(),
  })).optional(),
});

const templateUpdateSchema = templateSchema.partial();

const versionSchema = z.object({
  content: z.string().min(1).max(1000),
  variables: z.record(z.object({
    type: z.string(),
    required: z.boolean(),
  })).optional(),
  changes: z.string().optional(),
});

const approvalSchema = z.object({
  comments: z.string().optional(),
});

// Get all templates with analytics
router.get('/', authenticate, async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { isPublic: true },
        ],
      },
      include: {
        analytics: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Get suggested templates based on user's recent messages
    const recentMessages = await prisma.message.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const suggestedTemplates = await prisma.template.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { isPublic: true },
        ],
        keywords: {
          hasSome: recentMessages.flatMap((msg) => msg.keywords || []),
        },
      },
      include: {
        analytics: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    });

    res.json({
      templates,
      suggestedTemplates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get template versions
router.get('/:id/versions', authenticate, async (req, res) => {
  try {
    const versions = await templateService.getVersions(req.params.id);
    res.json({ versions });
  } catch (error) {
    console.error('Error fetching template versions:', error);
    res.status(500).json({ error: 'Failed to fetch template versions' });
  }
});

// Create new template version
router.post(
  '/:id/versions',
  authenticate,
  validateRequest({ body: versionSchema }),
  async (req, res) => {
    try {
      const version = await templateService.createVersion(
        req.params.id,
        req.body.content,
        req.body.variables,
        req.body.changes || '',
        req.user.id
      );
      res.status(201).json(version);
    } catch (error) {
      console.error('Error creating template version:', error);
      res.status(500).json({ error: 'Failed to create template version' });
    }
  }
);

// Rollback to previous version
router.post(
  '/:id/rollback/:version',
  authenticate,
  async (req, res) => {
    try {
      const template = await templateService.rollbackVersion(
        req.params.id,
        parseInt(req.params.version)
      );
      res.json(template);
    } catch (error) {
      console.error('Error rolling back template version:', error);
      res.status(500).json({ error: 'Failed to rollback template version' });
    }
  }
);

// Get template analytics
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    const analytics = await prisma.templateAnalytics.findUnique({
      where: { templateId: req.params.id },
    });
    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching template analytics:', error);
    res.status(500).json({ error: 'Failed to fetch template analytics' });
  }
});

// Update template analytics
router.post(
  '/:id/analytics',
  authenticate,
  async (req, res) => {
    try {
      const { responseTime, engagementRate, conversionRate } = req.body;
      let analytics;

      if (responseTime) {
        analytics = await templateService.trackTemplateUsage(req.params.id, responseTime);
      }

      if (engagementRate !== undefined || conversionRate !== undefined) {
        analytics = await templateService.updateEngagementMetrics(
          req.params.id,
          engagementRate,
          conversionRate
        );
      }

      res.json({ analytics });
    } catch (error) {
      console.error('Error updating template analytics:', error);
      res.status(500).json({ error: 'Failed to update template analytics' });
    }
  }
);

// Submit template for approval
router.post(
  '/:id/submit',
  authenticate,
  async (req, res) => {
    try {
      const template = await templateService.submitForApproval(
        req.params.id,
        req.body.approverId
      );
      res.json(template);
    } catch (error) {
      console.error('Error submitting template for approval:', error);
      res.status(500).json({ error: 'Failed to submit template for approval' });
    }
  }
);

// Approve template
router.post(
  '/:id/approve',
  authenticate,
  validateRequest({ body: approvalSchema }),
  async (req, res) => {
    try {
      const template = await templateService.approveTemplate(
        req.params.id,
        req.user.id,
        req.body.comments
      );
      res.json(template);
    } catch (error) {
      console.error('Error approving template:', error);
      res.status(500).json({ error: 'Failed to approve template' });
    }
  }
);

// Reject template
router.post(
  '/:id/reject',
  authenticate,
  validateRequest({ body: approvalSchema }),
  async (req, res) => {
    try {
      const template = await templateService.rejectTemplate(
        req.params.id,
        req.user.id,
        req.body.comments || 'No comments provided'
      );
      res.json(template);
    } catch (error) {
      console.error('Error rejecting template:', error);
      res.status(500).json({ error: 'Failed to reject template' });
    }
  }
);

// Process template variables
router.post(
  '/:id/process',
  authenticate,
  async (req, res) => {
    try {
      const content = await templateService.processTemplateVariables(
        req.params.id,
        req.body.variables
      );
      res.json({ content });
    } catch (error) {
      console.error('Error processing template variables:', error);
      res.status(500).json({ error: 'Failed to process template variables' });
    }
  }
);

// Create new template
router.post(
  '/',
  authenticate,
  validateRequest({ body: templateSchema }),
  async (req, res) => {
    try {
      const template = await prisma.template.create({
        data: {
          ...req.body,
          userId: req.user.id,
        },
      });

      // Create initial version
      await templateService.createVersion(
        template.id,
        template.content,
        template.variables,
        'Initial version',
        req.user.id
      );

      // Initialize analytics
      await prisma.templateAnalytics.create({
        data: {
          templateId: template.id,
        },
      });

      WebSocketService.broadcast('template:created', template);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }
);

// Update template
router.put(
  '/:id',
  authenticate,
  validateRequest({ body: templateUpdateSchema }),
  async (req, res) => {
    try {
      const template = await prisma.template.findUnique({
        where: { id: req.params.id },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedTemplate = await prisma.template.update({
        where: { id: req.params.id },
        data: req.body,
      });

      // Create new version if content or variables changed
      if (req.body.content || req.body.variables) {
        await templateService.createVersion(
          template.id,
          req.body.content || template.content,
          req.body.variables || template.variables,
          'Template updated',
          req.user.id
        );
      }

      WebSocketService.broadcast('template:updated', updatedTemplate);
      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }
);

// Delete template
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.template.delete({
      where: { id: req.params.id },
    });

    WebSocketService.broadcast('template:deleted', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Get suggested templates
router.post('/suggest', authenticate, async (req, res) => {
  try {
    const { message, category } = req.body;

    // Extract keywords from message if provided
    const keywords = message
      ? message
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 3)
      : [];

    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { isPublic: true },
        ],
        AND: [
          category ? { category } : {},
          keywords.length > 0
            ? {
                keywords: {
                  hasSome: keywords,
                },
              }
            : {},
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    });

    res.json({ templates });
  } catch (error) {
    console.error('Error getting suggested templates:', error);
    res.status(500).json({ error: 'Failed to get suggested templates' });
  }
});

export default router; 