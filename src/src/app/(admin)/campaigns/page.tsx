'use client';
import { useEffect, useState } from 'react';

export default function Campaigns() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/campaigns', {
        headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }
    })
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setCampaigns(data);
      })
      .catch(err => console.error("Failed to load campaigns", err));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Campaigns</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            + Create Campaign
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alias</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((camp) => (
              <tr key={camp.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{camp.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{camp.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{camp.alias}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${camp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {camp.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No campaigns found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
