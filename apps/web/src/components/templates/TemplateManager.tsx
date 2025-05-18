import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  ChartBarIcon,
  ClockIcon,
  TagIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { TemplateEditor } from './TemplateEditor';
import { TemplateAnalytics } from './TemplateAnalytics';
import { TemplateVersionHistory } from './TemplateVersionHistory';
import { TemplateApproval } from './TemplateApproval';
import { useTemplates } from '../../hooks/useTemplates';
import { useTemplateAnalytics } from '../../hooks/useTemplateAnalytics';
import { Template, TemplateAnalytics as TemplateAnalyticsType } from '../../types';

interface TemplateManagerProps {
  onTemplateSelect?: (template: Template) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showApproval, setShowApproval] = useState(false);

  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    suggestTemplates,
  } = useTemplates();

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    updateAnalytics,
  } = useTemplateAnalytics();

  // Keyboard shortcuts
  useHotkeys('ctrl+shift+t', () => setShowAnalytics(true));
  useHotkeys('ctrl+shift+v', () => setShowVersionHistory(true));
  useHotkeys('ctrl+shift+a', () => setShowApproval(true));

  // Filter templates based on search, category, and tags
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every((tag) => template.tags.includes(tag));
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Get suggested templates based on context
  const suggestedTemplates = suggestTemplates();

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template);
  };

  // Handle template creation
  const handleCreateTemplate = async (templateData: Partial<Template>) => {
    try {
      const newTemplate = await createTemplate(templateData);
      setSelectedTemplate(newTemplate);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  // Handle template update
  const handleUpdateTemplate = async (templateId: string, updates: Partial<Template>) => {
    try {
      const updatedTemplate = await updateTemplate(templateId, updates);
      setSelectedTemplate(updatedTemplate);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Handle analytics update
  const handleAnalyticsUpdate = async (templateId: string, updates: Partial<TemplateAnalyticsType>) => {
    try {
      await updateAnalytics(templateId, updates);
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading templates: {error.message}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Template Manager</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAnalytics(true)}
              className="btn btn-primary"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setView(view === 'list' ? 'grid' : 'list')}
              className="btn btn-secondary"
            >
              {view === 'list' ? 'Grid View' : 'List View'}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered flex-1"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-bordered"
          >
            <option value="all">All Categories</option>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="collaboration">Collaboration</option>
            <option value="custom">Custom</option>
          </select>
          <div className="flex space-x-2">
            {['urgent', 'follow-up', 'welcome'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTags(
                  selectedTags.includes(tag)
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag]
                )}
                className={`btn btn-sm ${
                  selectedTags.includes(tag) ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                <TagIcon className="h-4 w-4 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className={`grid ${
          view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        } gap-4`}>
          <AnimatePresence>
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`card ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <h3 className="card-title">{template.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className="btn btn-ghost btn-sm"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {template.version}
                      </span>
                      <span className="text-sm text-gray-500">
                        <DocumentDuplicateIcon className="h-4 w-4 inline mr-1" />
                        {analytics[template.id]?.usageCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {template.status === 'approved' ? (
                        <CheckCircleIcon className="h-5 w-5 text-success" />
                      ) : template.status === 'rejected' ? (
                        <XCircleIcon className="h-5 w-5 text-error" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedTemplate && (
          <TemplateEditor
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onSave={handleUpdateTemplate}
          />
        )}

        {showAnalytics && (
          <TemplateAnalytics
            analytics={analytics}
            onClose={() => setShowAnalytics(false)}
            onUpdate={handleAnalyticsUpdate}
          />
        )}

        {showVersionHistory && selectedTemplate && (
          <TemplateVersionHistory
            template={selectedTemplate}
            onClose={() => setShowVersionHistory(false)}
            onRollback={handleUpdateTemplate}
          />
        )}

        {showApproval && selectedTemplate && (
          <TemplateApproval
            template={selectedTemplate}
            onClose={() => setShowApproval(false)}
            onApprove={handleUpdateTemplate}
            onReject={handleUpdateTemplate}
          />
        )}
      </AnimatePresence>

      {/* Quick Access Panel */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white rounded-lg shadow-lg p-4 w-80">
          <h3 className="text-lg font-semibold mb-2">Suggested Templates</h3>
          <div className="space-y-2">
            {suggestedTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="w-full text-left p-2 hover:bg-gray-100 rounded"
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-gray-600">{template.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 