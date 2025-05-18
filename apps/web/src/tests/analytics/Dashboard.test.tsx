import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from '@/components/analytics/Dashboard';
import { ThemeProvider } from '@/hooks/useTheme';

// Mock data
const mockData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Users',
      data: [100, 200, 300, 400, 500],
    },
  ],
};

const mockMetrics = [
  {
    label: 'Total Users',
    value: '1,234',
    change: '+12%',
    trend: 'up',
  },
  {
    label: 'Active Users',
    value: '567',
    change: '+5%',
    trend: 'up',
  },
];

describe('Dashboard Component', () => {
  const renderDashboard = (props = {}) => {
    return render(
      <ThemeProvider>
        <Dashboard
          title="User Analytics"
          subtitle="Track user engagement and activity"
          data={mockData}
          type="line"
          metrics={mockMetrics}
          {...props}
        />
      </ThemeProvider>
    );
  };

  it('renders dashboard with title and subtitle', () => {
    renderDashboard();
    expect(screen.getByText('User Analytics')).toBeInTheDocument();
    expect(screen.getByText('Track user engagement and activity')).toBeInTheDocument();
  });

  it('renders metrics correctly', () => {
    renderDashboard();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    renderDashboard({ loading: true });
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('handles error state', () => {
    const error = 'Failed to load data';
    renderDashboard({ error });
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('toggles real-time updates', async () => {
    renderDashboard();
    const toggleButton = screen.getByRole('button', { name: /real-time/i });
    
    expect(toggleButton).toHaveTextContent('Enable Real-time');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(toggleButton).toHaveTextContent('Disable Real-time');
    });
  });

  it('applies date range filter', async () => {
    const onDateRangeChange = jest.fn();
    renderDashboard({ onDateRangeChange });

    const startDate = screen.getByLabelText(/start date/i);
    const endDate = screen.getByLabelText(/end date/i);

    fireEvent.change(startDate, { target: { value: '2024-01-01' } });
    fireEvent.change(endDate, { target: { value: '2024-01-31' } });

    await waitFor(() => {
      expect(onDateRangeChange).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });
  });

  it('applies role filter', async () => {
    const onFilterChange = jest.fn();
    renderDashboard({ onFilterChange });

    const roleSelect = screen.getByLabelText(/role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({
        role: 'admin',
      });
    });
  });

  it('renders different chart types', () => {
    const { rerender } = renderDashboard({ type: 'line' });
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Dashboard
          title="User Analytics"
          subtitle="Track user engagement and activity"
          data={mockData}
          type="bar"
          metrics={mockMetrics}
        />
      </ThemeProvider>
    );
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Dashboard
          title="User Analytics"
          subtitle="Track user engagement and activity"
          data={mockData}
          type="area"
          metrics={mockMetrics}
        />
      </ThemeProvider>
    );
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('handles empty data state', () => {
    renderDashboard({ data: { labels: [], datasets: [] } });
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('applies dark mode styles', () => {
    renderDashboard();
    const dashboard = screen.getByTestId('dashboard');
    
    // Toggle dark mode
    const themeToggle = screen.getByRole('button', { name: /theme/i });
    fireEvent.click(themeToggle);

    expect(dashboard).toHaveClass('dark');
  });
}); 