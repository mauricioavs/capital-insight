import React, { useEffect, useState } from 'react';
import { getSummaryByUser } from '../api';

interface Props {
  userId: string;
}

export const SummaryView: React.FC<Props> = ({ userId }) => {
  const [summary, setSummary] = useState<any[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const data = await getSummaryByUser(userId);
      setSummary(data.records);
    };

    fetchSummary();
  }, [userId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Resumen de {userId}</h2>
      <ul>
        {(Array.isArray(summary) ? summary : []).map((item, idx) => (
          <li key={idx}>
            {item.date} - {item.category}: ${item.amount} ({item.description})
          </li>
        ))}
      </ul>
    </div>
  );
};
