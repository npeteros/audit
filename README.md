# 💰 AuditPH

**Track All Your Wallets in One Place | Free Expense Tracker Built for Filipinos**

AuditPH is an intuitive and powerful expense tracker web application designed for small businesses and individuals to manage finances effortlessly. Stop juggling spreadsheets—track cash, banks, and e-wallets in one unified dashboard with instant insights and smart categorization.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://auditph.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## ✨ Features

### 🎯 Core Features

- **Multi-Wallet Management**: Track all your wallets (cash, banks, e-wallets) in one unified dashboard
- **Transaction Tracking**: Record and categorize income and expenses with ease
- **Real-Time Analytics**: Get instant insights into your spending patterns with powerful date range filtering
- **Smart Categorization**: Pre-built categories for common expenses plus custom category creation
- **Bulk Operations**: Delete multiple transactions, wallets, or categories at once
- **AI Financial Assistant**: Chat with an AI agent to analyze your financial data (experimental)

### 🔐 Authentication & Security

- **Magic Link Login**: Passwordless authentication via email
- **Google One-Tap**: Quick sign-in with Google account
- **Built-in Safeguards**: Protection against accidental deletion

### 📊 Dashboard Features

- **Overview Dashboard**: Real-time financial summary and insights
- **Transaction Management**: Create, read, update, and delete transactions
- **Wallet Management**: Manage multiple wallets with balance tracking
- **Category Management**: Organize transactions with custom categories
- **Reports & Analytics**: Visual insights with charts powered by Recharts

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.1.4](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: ShadCN UI
- **State Management**: TanStack React Query
- **Forms**: TanStack React Form
- **Charts**: Recharts
- **Theming**: next-themes (Dark/Light mode)

### Backend

- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **AI Agent**: OpenAI GPT-4o-mini with AI SDK

### Infrastructure

- **Hosting**: Vercel
- **Database Hosting**: Supabase
- **Version Control**: Git

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm/bun
- PostgreSQL database (or Supabase account)
- OpenAI API key (for AI assistant feature)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/auditph.git
    cd auditph
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3. **Set up environment variables**

    Create a `.env.local` file in the root directory:

    ```env
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

    # Database
    DATABASE_URL=your_postgresql_connection_string

    # OpenAI (for AI Assistant)
    OPENAI_API_KEY=your_openai_api_key

    # Google OAuth (optional)
    GOOGLE_CLIENT_ID=your_google_client_id
    ```

4. **Set up the database**

    ```bash
    # Generate Prisma client
    npx prisma generate

    # Run migrations
    npx prisma migrate deploy

    # Seed the database (optional)
    npx prisma db seed
    ```

5. **Run the development server**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

6. **Open your browser**

    Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
auditph/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── logout/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── chat/                 # AI chatbot endpoint
│   │   ├── transactions/
│   │   └── wallets/
│   ├── dashboard/                # Dashboard pages
│   │   ├── categories/
│   │   ├── reports/
│   │   ├── transactions/
│   │   └── wallets/
│   ├── _components/              # Landing page components
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── providers/                # Context providers
│   ├── shared/                   # Shared components
│   └── ui/                       # UI primitives (shadcn/ui)
├── lib/                          # Utility libraries
│   ├── agent/                    # AI financial analyst agent
│   │   └── tools/                # Agent tools (transaction, wallet, category queries)
│   ├── api/                      # API client functions
│   ├── embeddings/               # Vector embeddings (if applicable)
│   ├── prisma/                   # Prisma client
│   └── supabase/                 # Supabase client configurations
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── services/                     # Business logic layer
├── types/                        # TypeScript type definitions
├── hooks/                        # Custom React hooks
└── public/                       # Static assets
```

---

## 📊 Database Schema

### Core Models

- **User**: User accounts with email authentication
- **Wallet**: Multiple wallet support (cash, bank, e-wallet)
- **Transaction**: Income and expense records with categorization
- **Category**: Transaction categories (global and user-specific)

### Key Relationships

- Users can have multiple wallets
- Wallets contain multiple transactions
- Transactions are linked to categories
- Categories can be global (system-wide) or user-specific

---

## 🤖 AI Financial Assistant

AuditPH features an experimental AI-powered financial assistant that helps you:

- Analyze spending patterns and income sources
- Provide financial summaries (income, expenses, balance)
- Query transactions by date, category, or wallet
- Compare spending across different time periods
- Show recent activity and transaction history

The AI agent uses OpenAI's GPT-4o-mini model with custom tools for read-only database access, ensuring your data remains secure.

---

## 🎨 Features Breakdown

### Landing Page

- Hero section with dashboard preview
- Problems section highlighting pain points
- Features showcase
- How it works guide
- Pricing information
- Call-to-action sections

### Dashboard

- **Overview**: Financial summary with charts
- **Transactions**: CRUD operations with filtering
- **Wallets**: Multi-wallet management
- **Categories**: Custom category creation
- **Reports**: Visual analytics and insights

### Authentication

- Magic link email authentication
- Google One-Tap sign-in
- Secure session management with Supabase

---

## 🧪 Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run database migrations
npx prisma studio    # Open Prisma Studio
npx prisma db seed   # Seed the database
```

---

## 🌐 Deployment

### Deploy to Vercel

The easiest way to deploy AuditPH is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/auditph)

### Environment Variables for Production

Make sure to set all required environment variables in your Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Neal Andrew Peteros**

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components
- [OpenAI](https://openai.com/) - AI capabilities
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📞 Support

For support, email support@auditph.com or open an issue in the GitHub repository.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Recurring transactions
- [ ] Budget goals and alerts
- [ ] Data export (CSV, PDF)
- [ ] Multi-currency support
- [ ] Receipt scanning with OCR
- [ ] Bank account integration
- [ ] Collaborative wallets (family/team)
- [ ] Advanced reporting and forecasting

---

**Built with ❤️ for Filipinos who want to take control of their finances.**
