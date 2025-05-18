import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '../common/Button';
import { useToast } from '@/hooks/useToast';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingRewards: number;
  earnedRewards: number;
}

interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  reward: number;
}

export function ReferralProgram() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingRewards: 0,
    earnedRewards: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, [session]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals');
      if (!response.ok) throw new Error('Failed to fetch referral data');
      const data = await response.json();
      setStats(data.stats);
      setReferrals(data.referrals);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      showToast('Error loading referral data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${session?.user?.referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      showToast('Referral link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying referral link:', error);
      showToast('Error copying referral link', 'error');
    }
  };

  const getRewardTier = (referrals: number) => {
    if (referrals >= 10) return 'Gold';
    if (referrals >= 5) return 'Silver';
    if (referrals >= 2) return 'Bronze';
    return 'Starter';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-2">Total Referrals</h3>
          <p className="text-2xl font-bold text-blue-500">{stats.totalReferrals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-2">Active Referrals</h3>
          <p className="text-2xl font-bold text-green-500">{stats.activeReferrals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-2">Pending Rewards</h3>
          <p className="text-2xl font-bold text-yellow-500">${stats.pendingRewards}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-2">Earned Rewards</h3>
          <p className="text-2xl font-bold text-purple-500">${stats.earnedRewards}</p>
        </motion.div>
      </div>

      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            readOnly
            value={`${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${session?.user?.referralCode}`}
            className={`flex-1 p-2 rounded border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}
          />
          <Button onClick={copyReferralLink} variant="primary">
            Copy Link
          </Button>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-xl font-bold mb-4">Reward Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Starter', 'Bronze', 'Silver', 'Gold'].map((tier) => (
            <div
              key={tier}
              className={`p-4 rounded-lg ${
                getRewardTier(stats.totalReferrals) === tier
                  ? 'border-2 border-blue-500'
                  : isDark
                  ? 'bg-gray-700'
                  : 'bg-gray-50'
              }`}
            >
              <h3 className="font-semibold mb-2">{tier}</h3>
              <p className="text-sm">
                {tier === 'Starter' && '0-1 referrals'}
                {tier === 'Bronze' && '2-4 referrals'}
                {tier === 'Silver' && '5-9 referrals'}
                {tier === 'Gold' && '10+ referrals'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-xl font-bold mb-4">Recent Referrals</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Reward</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr
                  key={referral.id}
                  className={`border-t ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <td className="p-2">{referral.email}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        referral.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {referral.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2">${referral.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 