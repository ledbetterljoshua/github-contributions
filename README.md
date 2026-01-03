# git-glow

Visualize your GitHub contribution history with a terminal aesthetic.

![git-glow](https://img.shields.io/badge/terminal-aesthetic-00ff88?style=flat-square)

## Features

- **Yearly Trends** - Area chart showing contributions over time (excludes incomplete current year)
- **Monthly Breakdown** - Bar chart with year selector for granular analysis
- **Stats Dashboard** - Total contributions, years active, average per year, best year
- **Terminal Aesthetic** - Neon green, scanlines, vignette, JetBrains Mono font
- **Persistent Auth** - Username and token saved to localStorage

## Setup

1. Clone and install:
```bash
git clone https://github.com/ledbetterljoshua/github-contributions.git
cd github-contributions
npm install
```

2. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens/new?scopes=read:user
   - Only needs `read:user` scope

3. Run the dev server:
```bash
npm run dev
```

4. Open http://localhost:3000, enter your GitHub username and token

## Tech Stack

- [Next.js 16](https://nextjs.org/) with App Router
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS v4](https://tailwindcss.com/)
- [GitHub GraphQL API](https://docs.github.com/en/graphql)
- [PostHog](https://posthog.com/) for analytics

## Environment Variables (Optional)

For analytics, create `.env.local`:

```
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## License

MIT
