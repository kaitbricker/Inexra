import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'sales' | 'support' | 'collaboration' | 'custom';
  keywords: string[];
}

interface MessageTemplateProps {
  onSelect: (template: Template) => void;
  onSave: (template: Omit<Template, 'id'>) => void;
  onDelete: (templateId: string) => void;
  onUpdate: (template: Template) => void;
  templates: Template[];
  suggestedTemplates?: Template[];
}

export default function MessageTemplate({
  onSelect,
  onSave,
  onDelete,
  onUpdate,
  templates,
  suggestedTemplates = [],
}: MessageTemplateProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Omit<Template, 'id'>>({
    name: '',
    content: '',
    category: 'custom',
    keywords: [],
  });

  const handleCreate = useCallback(() => {
    onSave(newTemplate);
    setNewTemplate({
      name: '',
      content: '',
      category: 'custom',
      keywords: [],
    });
    setIsCreating(false);
  }, [newTemplate, onSave]);

  const handleUpdate = useCallback(
    (template: Template) => {
      onUpdate(template);
      setIsEditing(null);
    },
    [onUpdate]
  );

  const addKeyword = useCallback(
    (keyword: string) => {
      if (!newTemplate.keywords.includes(keyword)) {
        setNewTemplate((prev) => ({
          ...prev,
          keywords: [...prev.keywords, keyword],
        }));
      }
    },
    [newTemplate.keywords]
  );

  const removeKeyword = useCallback(
    (keyword: string) => {
      setNewTemplate((prev) => ({
        ...prev,
        keywords: prev.keywords.filter((k) => k !== keyword),
      }));
    },
    []
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Message Templates</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Template
        </button>
      </div>

      {suggestedTemplates.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Suggested Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                onClick={() => onSelect(template)}
              >
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{template.content}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 rounded-lg p-4 mb-4"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      category: e.target.value as Template['category'],
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="sales">Sales</option>
                  <option value="support">Support</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Keywords
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {newTemplate.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add keyword..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        addKeyword(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 min-w-[120px] px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Template
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            {isEditing === template.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) =>
                    handleUpdate({ ...template, name: e.target.value })
                  }
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <textarea
                  value={template.content}
                  onChange={(e) =>
                    handleUpdate({ ...template, content: e.target.value })
                  }
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleUpdate(template)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(template.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(template.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{template.content}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onSelect(template)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  Use Template
                </button>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
} 