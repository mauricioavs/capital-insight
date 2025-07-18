import React, { useEffect, useState } from 'react';
import { UserCard } from './UserCard';
import { getAllSummaries } from '../api';

interface Props {
  onSelectUser: (userId: string) => void;
}

export const UserList: React.FC<Props> = ({ onSelectUser }) => {
  const [userIds, setUserIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchSummaries = async () => {
      const data = await getAllSummaries();
      const ids = [...new Set(data.map((d: any) => d.user_id))];
      setUserIds(ids);
    };

    fetchSummaries();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {userIds.map((id) => (
        <UserCard key={id} userId={id} onSelect={onSelectUser} />
      ))}
    </div>
  );
};
