import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-800">
          Keitaro Next
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Dashboard
          </Link>
          <Link href="/campaigns" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Campaigns
          </Link>
          <Link href="/flows" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Flows
          </Link>
          <Link href="/landings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Landings
          </Link>
          <Link href="/offers" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Offers
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}
