import sgMail from '@sendgrid/mail';
import { User } from '@prisma/client';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const templates: Record<string, (user: User) => EmailTemplate> = {
  welcome: user => ({
    subject: `Welcome to Inexra, ${user.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">Welcome to Inexra!</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining Inexra! We're excited to have you on board.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore our templates</li>
          <li>Connect your social accounts</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <div style="margin-top: 20px; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
          <p style="margin: 0;">Get started by visiting your dashboard:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 4px;">
            Go to Dashboard
          </a>
        </div>
      </div>
    `,
    text: `Welcome to Inexra, ${user.name}!\n\nThank you for joining Inexra! We're excited to have you on board.\n\nGet started by visiting your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  }),

  onboarding: user => ({
    subject: 'Complete Your Inexra Onboarding',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">Complete Your Onboarding</h1>
        <p>Hi ${user.name},</p>
        <p>We noticed you haven't completed your onboarding yet. Here's what you're missing out on:</p>
        <ul>
          <li>Access to premium templates</li>
          <li>Advanced analytics features</li>
          <li>Team collaboration tools</li>
        </ul>
        <div style="margin-top: 20px; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
          <p style="margin: 0;">Complete your onboarding now:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" 
             style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 4px;">
            Complete Onboarding
          </a>
        </div>
      </div>
    `,
    text: `Complete Your Inexra Onboarding\n\nHi ${user.name},\n\nWe noticed you haven't completed your onboarding yet. Complete it now: ${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
  }),

  featureUpdate: user => ({
    subject: 'New Features Available in Inexra',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">New Features Available!</h1>
        <p>Hi ${user.name},</p>
        <p>We've added some exciting new features to Inexra:</p>
        <ul>
          <li>Advanced analytics dashboard</li>
          <li>Team collaboration tools</li>
          <li>New message templates</li>
        </ul>
        <div style="margin-top: 20px; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
          <p style="margin: 0;">Check out the new features:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/features" 
             style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 4px;">
            Explore Features
          </a>
        </div>
      </div>
    `,
    text: `New Features Available in Inexra\n\nHi ${user.name},\n\nWe've added some exciting new features to Inexra. Check them out: ${process.env.NEXT_PUBLIC_APP_URL}/features`,
  }),
};

export async function sendEmail(user: User, template: keyof typeof templates) {
  try {
    const { subject, html, text } = templates[template](user);

    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      html,
      text,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(user: User) {
  return sendEmail(user, 'welcome');
}

export async function sendOnboardingReminder(user: User) {
  return sendEmail(user, 'onboarding');
}

export async function sendFeatureUpdate(user: User) {
  return sendEmail(user, 'featureUpdate');
}
