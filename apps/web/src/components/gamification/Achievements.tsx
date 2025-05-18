import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/styles/theme';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  completed: boolean;
  reward: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar: string;
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchAchievements();
    fetchLeaderboard();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (!response.ok) throw new Error('Failed to fetch achievements');
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-6 rounded-lg shadow-lg',
          isDark ? 'bg-gray-800' : 'bg-white'
        )}
      >
        <h2 className="text-xl font-bold mb-4">Your Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'p-4 rounded-lg border',
                achievement.completed
                  ? 'border-green-500 bg-green-50 dark:bg-green-900'
                  : isDark
                  ? 'border-gray-700 bg-gray-700'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {achievement.description}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full',
                      achievement.completed
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    )}
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              </div>
              {achievement.completed && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-300">
                  Reward: {achievement.reward} points
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'p-6 rounded-lg shadow-lg',
          isDark ? 'bg-gray-800' : 'bg-white'
        )}
      >
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn(
                'text-left',
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              )}>
                <th className="p-2">Rank</th>
                <th className="p-2">User</th>
                <th className="p-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.id}
                  className={cn(
                    'border-t',
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  )}
                >
                  <td className="p-2">
                    <div className="flex items-center">
                      {entry.rank <= 3 ? (
                        <span className="text-xl mr-2">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="w-6 text-center">{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{entry.name}</span>
                    </div>
                  </td>
                  <td className="p-2 font-semibold">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 