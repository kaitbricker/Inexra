import { render, screen, waitFor } from '@testing-library/react';
import { Achievements } from '../Achievements';

// Mock the API calls
jest.mock('@/lib/api', () => ({
  get: jest.fn((url) => {
    if (url === '/api/achievements') {
      return Promise.resolve({
        data: [
          {
            id: 'task_master',
            title: 'Task Master',
            description: 'Complete 5 tasks in a day',
            points: 100,
            progress: 80,
            completed: false,
          },
        ],
      });
    }
    if (url === '/api/leaderboard') {
      return Promise.resolve({
        data: [
          {
            id: 'user1',
            name: 'Test User',
            points: 500,
            rank: 1,
            avatar: 'https://example.com/avatar.jpg',
          },
        ],
      });
    }
    return Promise.resolve({ data: [] });
  }),
}));

describe('Achievements', () => {
  it('renders loading state initially', () => {
    render(<Achievements />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders achievements and leaderboard after loading', async () => {
    render(<Achievements />);

    await waitFor(() => {
      expect(screen.getByText('Task Master')).toBeInTheDocument();
      expect(screen.getByText('Complete 5 tasks in a day')).toBeInTheDocument();
      expect(screen.getByText('100 points')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('500 points')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));

    render(<Achievements />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load achievements')).toBeInTheDocument();
    });
  });
}); 