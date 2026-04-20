'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to load stats", err));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm uppercase font-semibold">Total Clicks</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.totals?.clicks || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm uppercase font-semibold">Conversions</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.totals?.conversions || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <h3 className="text-gray-500 text-sm uppercase font-semibold">Revenue</h3>
                <p className="text-3xl font-bold text-gray-800">${stats.totals?.revenue?.toFixed(2) || '0.00'}</p>
            </div>
        </div>
      ) : (
          <p>Loading stats...</p>
      )}
    </div>
  );
}
