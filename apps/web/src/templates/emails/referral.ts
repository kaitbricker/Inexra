type User = { email: string };

interface ReferralRewardEmailData {
  amount: number;
  referralEmail: string;
}

interface ReferralActivatedEmailData {
  referralEmail: string;
}

export const referralTemplates = {
  referralReward: (user: User, data: ReferralRewardEmailData) => ({
    subject: '🎉 You earned a referral reward!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Congratulations!</h1>
        <p>Hi ${user.email},</p>
        <p>Great news! You've earned a reward for your successful referral.</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reward Amount:</strong> $${data.amount.toFixed(2)}</p>
          <p style="margin: 10px 0 0 0;"><strong>Referred User:</strong> ${data.referralEmail}</p>
        </div>
        <p>Your reward has been automatically added to your account balance.</p>
        <p>Keep sharing and earning more rewards!</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Your Dashboard
          </a>
        </div>
      </div>
    `,
  }),

  referralActivated: (user: User, data: ReferralActivatedEmailData) => ({
    subject: '✨ Your referral has activated their account!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Referral Activated!</h1>
        <p>Hi ${user.email},</p>
        <p>Great news! Your referral has activated their account.</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Referred User:</strong> ${data.referralEmail}</p>
        </div>
        <p>Once they complete their profile, you'll earn your reward!</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Your Dashboard
          </a>
        </div>
      </div>
    `,
  }),

  referralReminder: (user: User) => ({
    subject: '📢 Don\'t forget to claim your referral rewards!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Claim Your Rewards</h1>
        <p>Hi ${user.email},</p>
        <p>You have pending referral rewards waiting to be claimed!</p>
        <p>Log in to your account to check your referral status and claim your rewards.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Your Dashboard
          </a>
        </div>
      </div>
    `,
  }),
}; 