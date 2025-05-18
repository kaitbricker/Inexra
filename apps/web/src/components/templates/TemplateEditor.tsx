import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Editor } from '@tinymce/tinymce-react';
import {
  XMarkIcon,
  PlusIcon,
  VariableIcon,
  TagIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { Template } from '../../types';

interface TemplateEditorProps {
  template?: Template;
  onClose: () => void;
  onSave: (templateId: string, updates: Partial<Template>) => Promise<void>;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState(template?.category || 'custom');
  const [tags, setTags] = useState<string[]>(template?.tags || []);
  const [variables, setVariables] = useState<Record<string, any>>(
    template?.variables || {}
  );
  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'text',
    required: false,
    defaultValue: '',
  });
  const [preview, setPreview] = useState('');

  // Update preview when content or variables change
  useEffect(() => {
    let previewContent = content;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{${key}}`, 'g');
      previewContent = previewContent.replace(placeholder, value.defaultValue || `[${key}]`);
    });
    setPreview(previewContent);
  }, [content, variables]);

  // Handle template save
  const handleSave = async () => {
    if (!template?.id) return;

    try {
      await onSave(template.id, {
        name,
        content,
        category,
        tags,
        variables,
      });
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  // Handle variable addition
  const handleAddVariable = () => {
    if (newVariable.name && !variables[newVariable.name]) {
      setVariables({
        ...variables,
        [newVariable.name]: {
          type: newVariable.type,
          required: newVariable.required,
          defaultValue: newVariable.defaultValue,
        },
      });
      setNewVariable({
        name: '',
        type: 'text',
        required: false,
        defaultValue: '',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {template ? 'Edit Template' : 'New Template'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Template name"
              />
            </div>

            <div>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="collaboration">Collaboration</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="label">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-primary"
                  >
                    {tag}
                    <button
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="input input-bordered flex-1"
                  placeholder="Add tag"
                />
                <button
                  onClick={handleAddTag}
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Variables */}
            <div>
              <label className="label">Variables</label>
              <div className="space-y-2 mb-2">
                {Object.entries(variables).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                  >
                    <VariableIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{key}</span>
                    <span className="text-sm text-gray-500">({value.type})</span>
                    {value.required && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                    <button
                      onClick={() => {
                        const { [key]: _, ...rest } = variables;
                        setVariables(rest);
                      }}
                      className="ml-auto text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  className="input input-bordered"
                  placeholder="Variable name"
                />
                <select
                  value={newVariable.type}
                  onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value })}
                  className="select select-bordered"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                </select>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newVariable.required}
                    onChange={(e) => setNewVariable({ ...newVariable, required: e.target.checked })}
                    className="checkbox"
                  />
                  <span className="text-sm">Required</span>
                </div>
                <input
                  type="text"
                  value={newVariable.defaultValue}
                  onChange={(e) => setNewVariable({ ...newVariable, defaultValue: e.target.value })}
                  className="input input-bordered"
                  placeholder="Default value"
                />
                <button
                  onClick={handleAddVariable}
                  className="btn btn-primary col-span-2"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Variable
                </button>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="label">Content</label>
              <Editor
                value={content}
                onEditorChange={(newContent) => setContent(newContent)}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                }}
              />
            </div>

            {/* Preview */}
            <div>
              <label className="label">Preview</label>
              <div className="p-4 bg-gray-50 rounded min-h-[100px] whitespace-pre-wrap">
                {preview}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            Save Template
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}; 