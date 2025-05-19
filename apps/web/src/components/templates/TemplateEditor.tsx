'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: string[];
}

interface TemplateEditorProps {
  template?: Template;
  onSave: (template: Omit<Template, 'id'>) => Promise<void>;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave }) => {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [content, setContent] = useState(template?.content || '');
  const [variables, setVariables] = useState<string[]>(template?.variables || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setError('Name and content are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave({
        name: name.trim(),
        description: description.trim(),
        content: content.trim(),
        variables,
      });
    } catch (err) {
      setError('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  }, [name, description, content, variables, onSave]);

  const handleAddVariable = useCallback(() => {
    setVariables((prev) => [...prev, '']);
  }, []);

  const handleVariableChange = useCallback((index: number, value: string) => {
    setVariables((prev) => prev.map((v, i) => (i === index ? value : v)));
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    // Extract variables from content
    const matches = newContent.match(/\{\{([^}]+)\}\}/g) || [];
    const extractedVars = matches.map((match) => match.slice(2, -2).trim());
    setVariables((prev) => {
      const newVars = Array.from(new Set([...prev, ...extractedVars]));
      return newVars.filter((v) => v);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{template ? 'Edit Template' : 'Create Template'}</CardTitle>
          <CardDescription>
            {template
              ? 'Modify your existing message template'
              : 'Create a new message template for your campaigns'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter template description"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                placeholder="Enter template content. Use {{variable}} for dynamic content."
                className="min-h-[200px]"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Variables</Label>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    <Input
                      value={variable}
                      onChange={(e) => handleVariableChange(index, e.target.value)}
                      placeholder="Enter variable"
                      disabled={isLoading}
                    />
                  </span>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariable}
                disabled={isLoading}
              >
                Add Variable
              </Button>
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Template'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

TemplateEditor.displayName = 'TemplateEditor';

export default TemplateEditor;
