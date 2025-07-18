import React from 'react';

interface Props {
  userId: string;
  onSelect: (userId: string) => void;
}

export const UserCard: React.FC<Props> = ({ userId, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(userId)}
      className="cursor-pointer border rounded p-4 hover:bg-gray-100"
    >
      <h3 className="text-lg font-semibold">Usuario: {userId}</h3>
    </div>
  );
};