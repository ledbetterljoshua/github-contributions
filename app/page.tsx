'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface YearData {
  year: number;
  total: number;
}

interface MonthData {
  month: string;
  count: number;
}

interface MonthlyData {
  year: number;
  months: MonthData[];
}

interface Stats {
  totalContributions: number;
  averagePerYear: number;
  bestYear: { year: number; total: number };
  yearsActive: number;
}

interface ContributionData {
  username: string;
  years: YearData[];
  monthlyData: MonthlyData[];
  stats: Stats;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [years, setYears] = useState(8);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ContributionData | null>(null);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showToken, setShowToken] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github-token');
    const savedUsername = localStorage.getItem('github-username');
    if (savedToken) setToken(savedToken);
    if (savedUsername) setUsername(savedUsername);
  }, []);

  const fetchData = async () => {
    if (!username || !token) {
      setError('Please enter both username and token');
      return;
    }

    setLoading(true);
    setError('');

    // Save to localStorage
    localStorage.setItem('github-token', token);
    localStorage.setItem('github-username', username);

    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, token, years }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
        if (result.years.length > 0) {
          setSelectedYear(result.years[result.years.length - 1].year);
        }
      }
    } catch {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearChartData = data?.years
    .filter((y) => y.year < currentYear) // Exclude incomplete current year
    .map((y) => ({
      year: y.year.toString(),
      contributions: y.total,
    })) || [];

  const monthChartData = selectedYear
    ? data?.monthlyData.find((m) => m.year === selectedYear)?.months || []
    : [];

  const maxMonthContrib = Math.max(...monthChartData.map((m) => m.count), 1);

  return (
    <div className="min-h-screen p-8 relative">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--terminal-green) 1px, transparent 1px),
            linear-gradient(90deg, var(--terminal-green) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <header className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-4 text-[var(--text-tertiary)] text-sm">
              ~/github/contributions
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="text-[var(--terminal-green)] glow">$</span>{' '}
            <span className="text-[var(--text-primary)]">git</span>{' '}
            <span className="text-[var(--accent-orange)]">contributions</span>
            <span className="cursor-blink" />
          </h1>

          <p className="text-[var(--text-secondary)] text-lg mt-4">
            Visualize your GitHub journey across the years
          </p>
        </header>

        {/* Input Form */}
        {!data && (
          <div
            className="animate-fade-in p-8 rounded-lg mb-8"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              animationDelay: '0.1s',
            }}
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  <span className="text-[var(--terminal-green)]">→</span> GitHub Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ledbetterljoshua"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--terminal-green)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  <span className="text-[var(--terminal-green)]">→</span> Personal Access Token
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="ml-2 text-xs text-[var(--accent-blue)] hover:underline"
                  >
                    {showToken ? 'hide' : 'show'}
                  </button>
                </label>
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--terminal-green)] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  <span className="text-[var(--terminal-green)]">→</span> Years to fetch
                </label>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="px-4 py-3 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--terminal-green)]"
                >
                  {[3, 5, 8, 10, 12, 15].map((y) => (
                    <option key={y} value={y}>
                      {y} years
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-[var(--accent-orange)] mb-4">
                <span className="text-red-500">ERROR:</span> {error}
              </p>
            )}

            <button
              onClick={fetchData}
              disabled={loading}
              className="px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{
                background: 'var(--terminal-green)',
                color: 'var(--bg-deep)',
              }}
            >
              {loading ? 'Fetching...' : '$ fetch --contributions'}
            </button>

            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Need a token?{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=read:user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-blue)] hover:underline"
              >
                Generate one here
              </a>{' '}
              (only needs <code className="text-[var(--terminal-green)]">read:user</code> scope)
            </p>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <StatCard
                label="Total Contributions"
                value={data.stats.totalContributions.toLocaleString()}
                color="var(--terminal-green)"
              />
              <StatCard
                label="Years Active"
                value={data.stats.yearsActive.toString()}
                color="var(--accent-blue)"
              />
              <StatCard
                label="Avg per Year"
                value={data.stats.averagePerYear.toLocaleString()}
                color="var(--accent-orange)"
              />
              <StatCard
                label="Best Year"
                value={`${data.stats.bestYear.year}`}
                subvalue={`${data.stats.bestYear.total.toLocaleString()} commits`}
                color="var(--contribution-max)"
              />
            </div>

            {/* Yearly Trend Chart */}
            <div
              className="p-6 rounded-lg animate-fade-in"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                animationDelay: '0.2s',
              }}
            >
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <span className="text-[var(--terminal-green)]">▸</span>
                Contributions Over Time
              </h2>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearChartData}>
                    <defs>
                      <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickFormatter={(v) => v.toLocaleString()}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#12131a',
                        border: '1px solid #2a2d38',
                        borderRadius: '8px',
                        color: '#e8e8e8',
                      }}
                      formatter={(value: number) => [value.toLocaleString(), 'Contributions']}
                    />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      stroke="#00ff88"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorContrib)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Year Selector + Monthly Breakdown */}
            <div
              className="p-6 rounded-lg animate-fade-in"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                animationDelay: '0.3s',
              }}
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <span className="text-[var(--terminal-green)]">▸</span>
                  Monthly Breakdown
                </h2>

                <div className="flex gap-2 flex-wrap">
                  {data.years.map((y) => (
                    <button
                      key={y.year}
                      onClick={() => setSelectedYear(y.year)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        selectedYear === y.year
                          ? 'bg-[var(--terminal-green)] text-[var(--bg-deep)]'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {y.year}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthChartData}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#12131a',
                        border: '1px solid #2a2d38',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#e8e8e8' }}
                      itemStyle={{ color: '#00ff88' }}
                      formatter={(value: number) => [value.toLocaleString(), 'Contributions']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {monthChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`rgba(0, 255, 136, ${0.3 + (entry.count / maxMonthContrib) * 0.7})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={() => setData(null)}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--terminal-green)] transition-colors"
              >
                ← fetch different user
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-tertiary)]">
          <p>
            Built with{' '}
            <span className="text-[var(--terminal-green)]">Next.js</span> +{' '}
            <span className="text-[var(--accent-blue)]">Recharts</span> +{' '}
            <span className="text-[var(--accent-orange)]">GitHub GraphQL API</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subvalue,
  color,
}: {
  label: string;
  value: string;
  subvalue?: string;
  color: string;
}) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="text-xs text-[var(--text-tertiary)] mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      {subvalue && (
        <div className="text-xs text-[var(--text-secondary)] mt-1">{subvalue}</div>
      )}
    </div>
  );
}
