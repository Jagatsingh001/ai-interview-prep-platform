'use client';

import Link from 'next/link';
import { COMPANIES } from '@/data/companies';

export default function CompaniesPage() {
  return (
    <main className="min-h-screen studio-ambience px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-studio-muted text-sm hover:text-studio-text transition">← Back home</a>

        <h1 className="font-display font-bold text-3xl mt-8">Company preparation</h1>
        <p className="text-studio-muted mt-2">Pick a company to see its interview process, past questions, and aptitude practice.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {COMPANIES.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="bg-studio-panel border border-studio-border rounded-xl p-6 hover:border-studio-accentDim transition flex flex-col"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-sm text-white shrink-0"
                  style={{ backgroundColor: company.color }}
                >
                  {company.initials}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">{company.name}</h3>
                  <p className="text-studio-accent text-xs font-mono mt-0.5">{company.expectedPackage}</p>
                </div>
              </div>
              <p className="text-studio-muted text-sm mt-4 flex-1">{company.shortDescription}</p>
              <span className="mt-5 text-sm font-semibold text-studio-accent">Start preparation →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
