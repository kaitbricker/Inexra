"use client";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { Switch } from "@headlessui/react";
import { Dialog } from "@headlessui/react";
import { CheckIcon, PencilIcon, TrashIcon, PlusIcon, ExclamationTriangleIcon, Cog6ToothIcon, DocumentTextIcon, LinkIcon, ShieldCheckIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { INSTAGRAM_ENDPOINTS } from '@/lib/instagram';
import { getInstagramUserInfo } from '@/lib/instagram';
import { updateUserSettings } from '@/lib/actions/user';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const ROLES = ["Marketer", "CX", "Brand Manager", "Other"];
const TONES = ["Friendly", "Professional", "Direct"];
const PLATFORMS = [
  { name: "Instagram", status: "connected" },
  { name: "LinkedIn", status: "not_connected" },
  { name: "TikTok", status: "coming_soon" },
  { name: "Manual Uploads", status: "enabled" },
];

const tabIcons = [
  <UserCircleIcon key="account" className="w-4 h-4 mr-1 text-indigo-400" />, // Account
  <DocumentTextIcon key="templates" className="w-4 h-4 mr-1 text-purple-400" />, // Templates
  <LinkIcon key="sources" className="w-4 h-4 mr-1 text-cyan-400" />, // Sources
  <Cog6ToothIcon key="social" className="w-4 h-4 mr-1 text-emerald-400" />, // Social Integrations
  <ShieldCheckIcon key="security" className="w-4 h-4 mr-1 text-rose-400" />, // Security
];

interface UploadError {
  [key: string]: string | null;
}

export default function SettingsPage() {
  // Account Tab State
  const [fullName, setFullName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane@brand.com");
  const [role, setRole] = useState(ROLES[0]);
  const [emailVerified] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [notifMentions, setNotifMentions] = useState(false);
  const [tagStack, setTagStack] = useState<string>("");

  // Templates Tab State
  const [templates, setTemplates] = useState([
    { id: 1, title: "Welcome Reply", body: "Hi there! Thanks for reaching out.", tags: ["Welcome"] },
    { id: 2, title: "Pricing Info", body: "Our pricing starts at $99/mo. Let me know if you have questions!", tags: ["Pricing"] },
  ]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const [aiTone, setAiTone] = useState(TONES[0]);
  const [aiSuggest, setAiSuggest] = useState(true);

  // Sources Tab State
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [platformToManage, setPlatformToManage] = useState<any>(null);

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([
    { id: 1, location: "NY, USA", device: "Chrome on Mac", lastLogin: "2024-06-20", active: true },
    { id: 2, location: "LA, USA", device: "Safari on iPhone", lastLogin: "2024-06-18", active: false },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Responsive tab orientation
  const [sidebar, setSidebar] = useState(false);

  // Tab labels
  const tabs = ["Account", "Templates", "Sources", "Security"];

  // Social Integrations Tab State
  const [connectedPlatforms, setConnectedPlatforms] = useState<{
    [key: string]: {
      connected: boolean;
      accountName?: string;
    };
  }>({
    Instagram: { connected: false },
    LinkedIn: { connected: false },
    TikTok: { connected: false }
  });

  // Add these state variables after the other state declarations
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({
    Instagram: false,
    LinkedIn: false,
    TikTok: false,
    Messages: false
  });

  const [uploadError, setUploadError] = useState<UploadError>({
    Instagram: null,
    LinkedIn: null,
    TikTok: null,
    Messages: null
  });

  // Add state for Instagram username
  const [instagramUsername, setInstagramUsername] = useState<string | null>(null);

  // Add state for message upload
  const [messageUploadStatus, setMessageUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Template Modal Handlers
  function openTemplateModal(template: any = null) {
    setEditingTemplate(template);
    setTemplateTitle(template ? template.title : "");
    setTemplateBody(template ? template.body : "");
    setTemplateTags(template ? template.tags?.join(", ") : "");
    setShowTemplateModal(true);
  }
  function saveTemplate() {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, title: templateTitle, body: templateBody, tags: templateTags.split(",").map((s) => s.trim()).filter(Boolean) } : t));
    } else {
      setTemplates([
        ...templates,
        { id: Date.now(), title: templateTitle, body: templateBody, tags: templateTags.split(",").map((s) => s.trim()).filter(Boolean) },
      ]);
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTemplateTitle("");
    setTemplateBody("");
    setTemplateTags("");
  }
  function deleteTemplate(id: number) {
    setTemplates(templates.filter(t => t.id !== id));
  }

  // Platform Modal Handlers
  function openPlatformModal(platform: any) {
    setPlatformToManage(platform);
    setShowPlatformModal(true);
  }
  function savePlatformCreds() {
    setShowPlatformModal(false);
    setPlatformToManage(null);
  }

  // Delete Account
  function confirmDeleteAccount() {
    setShowDeleteModal(false);
    // ...delete logic
  }

  // Update handleConnect for Instagram
  const handleConnect = async (platform: string) => {
    try {
      if (platform === 'Instagram') {
        // Redirect to Instagram OAuth
        window.location.href = INSTAGRAM_ENDPOINTS.authorize;
        return;
      }

      // For LinkedIn and TikTok, handle file upload
      setUploading(prev => ({ ...prev, [platform]: true }));
      setUploadError(prev => ({ ...prev, [platform]: null }));

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('platform', platform);

        try {
          console.log('Uploading file:', file.name, 'for platform:', platform);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          const data = await response.json();
          console.log('Upload response:', data);

          if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
          }

          if (!data.success) {
            throw new Error(data.error || 'Upload failed');
          }

          setConnectedPlatforms(prev => ({
            ...prev,
            [platform]: {
              connected: true,
              accountName: data.accountName || platform,
            },
          }));
        } catch (error) {
          console.error(`Error uploading ${platform} file:`, error);
          setUploadError(prev => ({
            ...prev,
            [platform]: error instanceof Error ? error.message : 'Failed to upload file. Please try again.',
          }));
        } finally {
          setUploading(prev => ({ ...prev, [platform]: false }));
        }
      };

      input.click();
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      setUploadError(prev => ({
        ...prev,
        [platform]: error instanceof Error ? error.message : 'Failed to connect. Please try again.',
      }));
    }
  };

  // Update handleDisconnect for Instagram
  const handleDisconnect = async (platform: string) => {
    try {
      if (platform === 'Instagram') {
        // Remove Instagram token from session/local state
        setConnectedPlatforms(prev => ({
          ...prev,
          Instagram: { connected: false, accountName: '' },
        }));
        setInstagramUsername(null);
        // Optionally, call a backend endpoint to revoke the token
        return;
      }
      const response = await fetch('/api/platforms/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setConnectedPlatforms(prev => ({
        ...prev,
        [platform]: {
          connected: false,
          accountName: '',
        },
      }));
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      // You might want to show an error message to the user here
    }
  };

  // On mount, check if Instagram is connected and fetch username
  useEffect(() => {
    async function fetchInstagramStatus() {
      try {
        const response = await fetch('/api/platforms/status');
        if (!response.ok) throw new Error('Failed to fetch platform status');
        const data = await response.json();
        
        if (data.instagram) {
          setConnectedPlatforms(prev => ({
            ...prev,
            Instagram: { 
              connected: true,
              accountName: data.instagram.accountName,
            },
          }));
          setInstagramUsername(data.instagram.accountName);
        }
      } catch (error) {
        console.error('Error fetching Instagram status:', error);
      }
    }
    fetchInstagramStatus();
  }, []);

  // Add message upload handler
  const handleMessageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, Messages: true }));
    setUploadError(prev => ({ ...prev, Messages: null }));
    setMessageUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('platform', 'manual'); // Set platform to manual for file uploads

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessageUploadStatus({
        success: true,
        message: `Successfully uploaded ${data.count || 0} messages. They will be processed by AI if enabled.`
      });
    } catch (error) {
      setUploadError(prev => ({
        ...prev,
        Messages: error instanceof Error ? error.message : 'Upload failed'
      }));
    } finally {
      setUploading(prev => ({ ...prev, Messages: false }));
    }
  };

  // Add this function after the other handlers
  const handleSaveSettings = async () => {
    try {
      const result = await updateUserSettings({ tagStack });
      if (result.success) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('An error occurred while saving settings.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">Settings</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sticky Sidebar for desktop */}
          <Tab.Group>
            <Tab.List className="md:sticky md:top-8 flex flex-row gap-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 w-full mb-4 md:mb-0 p-1">
              {tabs.map((tab, i) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    classNames(
                      "w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200",
                      selected
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )
                  }
                >
                  {tabIcons[i]} {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="flex-1 space-y-6">
              {/* Account Tab */}
              <Tab.Panel>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2"><UserCircleIcon className="w-5 h-5 text-indigo-500" /> Account Settings</h2>
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50/50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</label>
                        <input className="mt-1 w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" />
                      </div>
                      <div className="rounded-lg bg-gray-50/50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                        <input className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" value={email} disabled={emailVerified} />
                      </div>
                      <div className="rounded-lg bg-gray-50/50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
                        <select className="mt-1 w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition" value={role} onChange={e => setRole(e.target.value)}>
                          {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="tagStack" className="block text-sm font-medium text-gray-700">
                        Preferred Tag Stack
                      </label>
                      <select
                        id="tagStack"
                        value={tagStack}
                        onChange={(e) => setTagStack(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">None</option>
                        <option value="brand">Brand Manager</option>
                        <option value="influencer">Influencer</option>
                        <option value="success">Customer Success</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        This determines which tags are shown in your inbox and dashboard views.
                      </p>
                    </div>
                    <button 
                      onClick={handleSaveSettings}
                      className="mt-6 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 hover:shadow transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">Notification Preferences</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Switch checked={notifEmail} onChange={setNotifEmail} className={classNames(notifEmail ? "bg-indigo-600" : "bg-gray-200", "relative inline-flex h-6 w-11 items-center rounded-full transition ring-1 ring-indigo-200 shadow-sm")}> <span className="sr-only">Enable Email Reports</span> <span className={classNames(notifEmail ? "translate-x-6" : "translate-x-1", "inline-block h-4 w-4 transform rounded-full bg-white transition")}/></Switch>
                        <span className="text-sm text-gray-700 dark:text-gray-200">Enable Email Reports</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={notifDigest} onChange={setNotifDigest} className={classNames(notifDigest ? "bg-indigo-600" : "bg-gray-200", "relative inline-flex h-6 w-11 items-center rounded-full transition ring-1 ring-indigo-200 shadow-sm")}> <span className="sr-only">Weekly Digest</span> <span className={classNames(notifDigest ? "translate-x-6" : "translate-x-1", "inline-block h-4 w-4 transform rounded-full bg-white transition")}/></Switch>
                        <span className="text-sm text-gray-700 dark:text-gray-200">Weekly Digest</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={notifMentions} onChange={setNotifMentions} className={classNames(notifMentions ? "bg-indigo-600" : "bg-gray-200", "relative inline-flex h-6 w-11 items-center rounded-full transition ring-1 ring-indigo-200 shadow-sm")}> <span className="sr-only">Mentions Only</span> <span className={classNames(notifMentions ? "translate-x-6" : "translate-x-1", "inline-block h-4 w-4 transform rounded-full bg-white transition")}/></Switch>
                        <span className="text-sm text-gray-700 dark:text-gray-200">Mentions Only</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              {/* Templates Tab */}
              <Tab.Panel>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-purple-500" /> Reply Templates</h2>
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">Saved Reply Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map(t => (
                        <div key={t.id} className="flex flex-col justify-between bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <DocumentTextIcon className="w-4 h-4 text-purple-500" />
                            <div className="font-semibold text-gray-800 dark:text-gray-100">{t.title}</div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-300 line-clamp-2 mb-2">{t.body}</div>
                          {t.tags && t.tags.length > 0 && <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-300">Tags: {t.tags.join(", ")}</div>}
                          <div className="flex gap-2 mt-3">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" onClick={() => openTemplateModal(t)}><PencilIcon className="w-4 h-4 text-gray-500" /></button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" onClick={() => deleteTemplate(t.id)}><TrashIcon className="w-4 h-4 text-gray-500" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 text-white font-medium shadow-sm hover:bg-purple-700 hover:shadow transition-all" onClick={() => openTemplateModal()}><PlusIcon className="w-4 h-4" /> Add New Template</button>
                  </div>
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">AI Personalization Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Default Tone</label>
                        <select className="mt-1 w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition" value={aiTone} onChange={e => setAiTone(e.target.value)}>
                          {TONES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-3 mt-2 md:mt-0">
                        <Switch checked={aiSuggest} onChange={setAiSuggest} className={classNames(aiSuggest ? "bg-purple-600" : "bg-gray-200", "relative inline-flex h-6 w-11 items-center rounded-full transition ring-1 ring-purple-200 shadow-sm")}> <span className="sr-only">Always suggest AI replies first</span> <span className={classNames(aiSuggest ? "translate-x-6" : "translate-x-1", "inline-block h-4 w-4 transform rounded-full bg-white transition")}/></Switch>
                        <span className="text-sm text-gray-700 dark:text-gray-200">Always suggest AI replies first</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Dialog open={showTemplateModal} onClose={() => setShowTemplateModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-auto p-6 z-10 animate-fade-in scale-95 animate-in">
                      <Dialog.Title className="text-lg font-bold mb-4 text-purple-700">{editingTemplate ? "Edit Template" : "Add New Template"}</Dialog.Title>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Template Title</label>
                        <input className="mt-1 w-full border rounded-lg px-3 py-2" value={templateTitle} onChange={e => setTemplateTitle(e.target.value)} />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Message Body</label>
                        <textarea className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[80px]" value={templateBody} onChange={e => setTemplateBody(e.target.value)} />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Tags <span className="text-xs text-gray-400">(comma separated, optional)</span></label>
                        <input className="mt-1 w-full border rounded-lg px-3 py-2" value={templateTags} onChange={e => setTemplateTags(e.target.value)} />
                      </div>
                      <div className="flex gap-2 justify-end mt-6">
                        <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                        <button className="px-4 py-2 rounded bg-purple-600 text-white font-bold shadow" onClick={saveTemplate}>{editingTemplate ? "Save Changes" : "Save Template"}</button>
                      </div>
                    </div>
                  </div>
                </Dialog>
              </Tab.Panel>
              {/* Sources Tab */}
              <Tab.Panel>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-cyan-500" /> Connected Sources</h2>
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">Social Platforms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Instagram */}
                      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Instagram</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Connect via OAuth</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          {connectedPlatforms.Instagram.connected ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Connected as {connectedPlatforms.Instagram.accountName || instagramUsername || 'Instagram User'}
                              </span>
                              <button
                                onClick={() => handleDisconnect('Instagram')}
                                className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900"
                              >
                                Disconnect
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConnect('Instagram')}
                              className="w-full rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900"
                            >
                              Connect Instagram
                            </button>
                          )}
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">LinkedIn</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Upload messages</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          {connectedPlatforms.LinkedIn.connected ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Connected as {connectedPlatforms.LinkedIn.accountName || 'LinkedIn User'}
                              </span>
                              <button
                                onClick={() => handleDisconnect('LinkedIn')}
                                className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900"
                              >
                                Disconnect
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConnect('LinkedIn')}
                              className="w-full rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900"
                            >
                              Connect LinkedIn
                            </button>
                          )}
                        </div>
                      </div>

                      {/* TikTok */}
                      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">TikTok</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            disabled
                            className="w-full rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                          >
                            Coming Soon
                          </button>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">File Upload</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Upload JSON, CSV, or Excel</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block w-full">
                            <span className="sr-only">Choose file</span>
                            <input
                              type="file"
                              accept=".json,.csv,.xlsx,.xls"
                              onChange={handleMessageUpload}
                              className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-emerald-50 file:text-emerald-700
                                dark:file:bg-emerald-900/50 dark:file:text-emerald-300
                                hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/70
                                cursor-pointer"
                            />
                          </label>
                          {uploading.Messages && (
                            <div className="mt-2 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                            </div>
                          )}
                          {uploadError.Messages && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError.Messages}</p>
                          )}
                          {messageUploadStatus && (
                            <p className={`mt-2 text-sm ${messageUploadStatus.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {messageUploadStatus.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              {/* Security Tab */}
              <Tab.Panel>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2"><ShieldCheckIcon className="w-5 h-5 text-rose-500" /> Security & Login</h2>
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-lg bg-gray-50/50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Current Password</label>
                        <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                      </div>
                      <div className="rounded-lg bg-gray-50/50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
                        <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      </div>
                      <div className="rounded-lg bg-gray-50/50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
                        <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      </div>
                    </div>
                    <button className="mt-6 px-6 py-2.5 rounded-lg bg-rose-600 text-white font-medium shadow-sm hover:bg-rose-700 hover:shadow transition-all">Update Password</button>
                  </div>
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">Account Security</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <Switch checked={twoFA} onChange={setTwoFA} className={classNames(twoFA ? "bg-rose-600" : "bg-gray-200", "relative inline-flex h-6 w-11 items-center rounded-full transition ring-1 ring-rose-200 shadow-sm")}> <span className="sr-only">2FA Enabled</span> <span className={classNames(twoFA ? "translate-x-6" : "translate-x-1", "inline-block h-4 w-4 transform rounded-full bg-white transition")}/></Switch>
                      <span className="text-sm text-gray-700 dark:text-gray-200">2FA Enabled</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border rounded-lg overflow-hidden shadow-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revoke</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionHistory.map(s => (
                            <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{s.location}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{s.device}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{s.lastLogin}</td>
                              <td className="px-4 py-3">{s.active ? <span className="text-green-600 font-medium">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                              <td className="px-4 py-3"><button className="text-rose-600 hover:text-rose-700 text-xs font-medium transition-colors">Revoke</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="bg-red-50/50 border-l-4 border-red-500 text-red-900 p-5 rounded-lg shadow-sm flex items-center gap-4 animate-fade-in mt-8">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="font-bold text-base text-red-900">Danger Zone</div>
                      <div className="text-sm mb-2">Deleting your account is <span className="font-semibold">irreversible</span>. All your data will be lost.</div>
                      <button className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 hover:shadow transition-all" onClick={() => setShowDeleteModal(true)}>Delete My Account</button>
                    </div>
                  </div>
                </div>
                <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-auto p-6 z-10 animate-fade-in scale-95 animate-in">
                      <Dialog.Title className="text-lg font-bold mb-4 text-red-700">Delete Account</Dialog.Title>
                      <div className="mb-4 text-sm text-gray-700 dark:text-gray-200">Are you sure you want to delete your account? This action cannot be undone.</div>
                      <div className="flex gap-2 justify-end mt-4">
                        <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        <button className="px-4 py-2 rounded bg-red-600 text-white font-semibold shadow" onClick={confirmDeleteAccount}>Delete My Account</button>
                      </div>
                    </div>
                  </div>
                </Dialog>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
} 