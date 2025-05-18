import React from 'react';

interface UserStatusBadgeProps {
  status: 'active' | 'suspended' | 'pending';
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  return (
    <span className={`user-status-badge user-status-${status}`}>
      {/* Color-coded badge for status */}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default UserStatusBadge; 