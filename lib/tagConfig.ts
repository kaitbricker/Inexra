export type Tag = {
  key: string;
  label: string;
  stack?: 'brand' | 'influencer' | 'success' | 'core';
  alwaysOn?: boolean;
};

export const TAGS: Tag[] = [
  { key: 'positive_feedback', label: 'Positive Feedback', stack: 'core', alwaysOn: true },
  { key: 'negative_feedback', label: 'Negative Feedback', stack: 'core', alwaysOn: true },
  { key: 'campaign_mention', label: 'Campaign Mention', stack: 'brand' },
  { key: 'ugc_request', label: 'UGC Request', stack: 'brand' },
  { key: 'collab_inquiry', label: 'Collab Inquiry', stack: 'influencer' },
  { key: 'product_complaint', label: 'Product Complaint', stack: 'success' },
  { key: 'churn_risk', label: 'Churn Risk', stack: 'success' },
  { key: 'onboarding', label: 'Onboarding', stack: 'success' },
  { key: 'bug_report', label: 'Bug Report', stack: 'core', alwaysOn: true },
  { key: 'support_request', label: 'Support Request', stack: 'success' },
]; 