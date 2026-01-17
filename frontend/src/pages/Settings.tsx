import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';

export default function Settings() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-6">Settings</h1>

        {/* Security Settings Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <h2 className="text-xl font-display font-semibold text-slate-900 mb-2">
            Security Settings
          </h2>
          <p className="text-slate-600 mb-6">Manage your account security preferences</p>

          <p className="text-slate-500 italic">No additional security settings available at this time.</p>
        </div>
      </div>
    </MainLayout>
  );
}