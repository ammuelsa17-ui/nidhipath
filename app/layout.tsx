import React from 'react';
import './globals.css';
import { Header } from '../components/Header';
import { StatusBanner } from '../components/StatusBanner';

export const metadata = {
  title: 'NidhiPath — AI-Driven Scheme Matching for Marginalized Entrepreneurs (SIH26092)',
  description: 'Right Scheme. Right Channel. Right Guidance. AI-assisted decision-support platform with deterministic rule-based eligibility evaluation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-200">
        <Header />
        <StatusBanner />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
            <p className="font-semibold text-slate-300">NidhiPath — Smart India Hackathon 2026 Project (PS ID: SIH26092)</p>
            <p className="text-slate-500">Core Engine: Deterministic Rule Matrix | Guidance: AI Contextual Assistant</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
