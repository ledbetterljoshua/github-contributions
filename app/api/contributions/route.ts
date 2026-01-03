import { NextRequest, NextResponse } from 'next/server';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface YearContributions {
  year: number;
  total: number;
  calendar: ContributionCalendar;
}

async function fetchYearContributions(
  username: string,
  token: string,
  from: string,
  to: string
): Promise<ContributionCalendar | null> {
  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username, from, to },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return null;
    }

    return data.data?.user?.contributionsCollection?.contributionCalendar || null;
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, token, years } = await request.json();

    if (!username || !token) {
      return NextResponse.json(
        { error: 'Username and token are required' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    const yearsToFetch = years || 5;
    const results: YearContributions[] = [];

    for (let i = 0; i < yearsToFetch; i++) {
      const year = currentYear - i;
      const from = `${year}-01-01T00:00:00Z`;
      const to = `${year}-12-31T23:59:59Z`;

      const calendar = await fetchYearContributions(username, token, from, to);

      if (calendar) {
        results.push({
          year,
          total: calendar.totalContributions,
          calendar,
        });
      }
    }

    // Sort by year ascending
    results.sort((a, b) => a.year - b.year);

    // Calculate some stats
    const totalContributions = results.reduce((sum, y) => sum + y.total, 0);
    const averagePerYear = Math.round(totalContributions / results.length);

    // Find best year
    const bestYear = results.reduce((best, curr) =>
      curr.total > best.total ? curr : best
    );

    // Calculate monthly data for each year
    const monthlyData = results.map(yearData => {
      const months: { month: string; count: number }[] = [];
      const monthCounts: { [key: string]: number } = {};

      yearData.calendar.weeks.forEach(week => {
        week.contributionDays.forEach(day => {
          const date = new Date(day.date);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

          if (!monthCounts[monthKey]) {
            monthCounts[monthKey] = 0;
          }
          monthCounts[monthKey] += day.contributionCount;
        });
      });

      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthOrder.forEach(month => {
        months.push({
          month,
          count: monthCounts[month] || 0,
        });
      });

      return {
        year: yearData.year,
        months,
      };
    });

    return NextResponse.json({
      username,
      years: results,
      monthlyData,
      stats: {
        totalContributions,
        averagePerYear,
        bestYear: {
          year: bestYear.year,
          total: bestYear.total,
        },
        yearsActive: results.length,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
