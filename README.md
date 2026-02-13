# Kasab - Pakistan's Premier Freelancing Platform

A full-stack, production-ready two-sided marketplace connecting verified Pakistani freelancers with serious clients. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### For Freelancers
- **3-Step Onboarding** - Identity verification, professional profile setup, and banking information
- **Job Discovery** - Browse curated job postings with detailed requirements
- **Smart Proposals** - Submit proposals with automatic platform fee calculation and delay penalties
- **Verification System** - Manual KYC verification with admin toggle (demo mode)
- **Certification Levels** - 3-tier certification system (Level 1, 2, 3)
- **Real-time Messaging** - Chat with clients after proposal approval
- **Payment Tracking** - View earnings, pending payments, and completed jobs
- **Portfolio Management** - Showcase work samples and skills

### For Clients
- **Job Posting** - Create detailed job listings with budget, duration, and skill requirements
- **Freelancer Discovery** - Browse and filter verified professionals by role, skills, and certification
- **Proposal Management** - Review, approve, or reject freelancer proposals
- **Contract Workflow** - Automated contract creation upon approval
- **Payment Escrow** - Secure payment system with platform fee deduction
- **Messaging** - Direct communication with hired freelancers

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Icons**: Lucide React
- **Deployment Ready**: Vercel-optimized

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))

### Step 1: Clone and Install

```bash
# Install dependencies
cd kasab-platform
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Run the SQL migration:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents from `supabase-schema.sql`
   - Execute the migration

### Step 3: Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 User Flows

### Freelancer Journey
1. **Signup** → Select "I'm a Freelancer"
2. **Onboarding** → Complete 3 steps (Identity, Professional Profile, Banking)
3. **Profile Status** → Starts as "Pending Verification"
4. **Browse Jobs** → View all open positions
5. **Submit Proposal** → Only when verified (use admin toggle in demo)
6. **Get Approved** → Client reviews and approves proposal
7. **Start Contract** → Receive message thread and payment info
8. **Complete Work** → Client marks complete and releases payment

### Client Journey
1. **Signup** → Select "I'm Hiring"
2. **Post Job** → Create job with title, description, budget, skills
3. **Browse Freelancers** → Filter by role, skill, certification, verification
4. **Review Proposals** → See all submitted proposals for your jobs
5. **Approve Proposal** → Creates contract, conversation, and payment escrow
6. **Communicate** → Message freelancer directly
7. **Complete & Pay** → Mark contract complete to release funds

## 🔐 Security Features

- **Row Level Security (RLS)** - All database tables protected with Supabase RLS policies
- **Authentication** - Supabase Auth with email/password
- **Role-based Access** - Freelancers and clients have separate permissions
- **Verification Gating** - Unverified freelancers cannot submit proposals
- **Payment Protection** - Escrow system with platform fee deduction

## 💰 Payment System

### Platform Fee Structure
- **10% platform fee** on all projects
- Automatically calculated and displayed in proposal breakdown
- Delay penalty: PKR 1,000 per day late (configurable)

Example:
```
Project Price:        PKR 50,000
Platform Fee (10%):  -PKR  5,000
Freelancer Earns:     PKR 45,000
```

## 📊 Database Schema

Key tables:
- `users` - Base user accounts
- `freelancer_profiles` - Freelancer-specific data
- `client_profiles` - Client-specific data
- `roles` - Professional roles (Developer, Designer, etc.)
- `skills` - Technical skills
- `jobs` - Job postings
- `proposals` - Freelancer proposals
- `contracts` - Active work agreements
- `messages` - In-app messaging
- `payments` - Payment tracking

See `supabase-schema.sql` for complete schema with indexes and triggers.

## 🎨 Design System

### Colors
- Background: `#F7F8FA`
- Primary: `#0A2540` (Navy)
- Secondary: `#1E3A8A` (Blue)
- Accent: `#3B82F6` (Bright Blue)
- Text: `#1F2937` (Dark Gray)

### Components
- Clean SaaS aesthetic inspired by Stripe and Linear
- High-trust whitespace
- Consistent card-based layouts
- Badge system for status indicators
- Responsive design for mobile and desktop

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 Testing the Platform

### Quick Demo Flow

1. **Create Freelancer Account**
   ```
   Email: freelancer@test.com
   Password: test123
   Type: Freelancer
   ```

2. **Complete Onboarding**
   - Fill CNIC: 12345-1234567-1
   - Select roles and skills
   - Add bank details

3. **Toggle Verification** (Admin Panel)
   - Click "Admin Controls" in yellow banner
   - Toggle to "Verified"

4. **Create Client Account**
   ```
   Email: client@test.com
   Password: test123
   Type: Client
   ```

5. **Post a Job** (as Client)
   - Title: "Build E-commerce Website"
   - Budget: PKR 100,000
   - Select skills

6. **Submit Proposal** (as Freelancer)
   - Browse jobs
   - Submit proposal with price
   - See fee breakdown

7. **Approve Proposal** (as Client)
   - View proposals on job
   - Click "Approve"
   - Contract and conversation created

8. **Complete Contract** (as Client)
   - Go to Contracts tab
   - Mark as complete
   - Payment released to freelancer

## 📝 Key Features Implemented

✅ Full authentication with Supabase Auth
✅ Role-based signup (Freelancer vs Client)
✅ 3-step freelancer onboarding
✅ KYC verification system with pending/verified states
✅ 3-tier certification levels
✅ Job posting with skills and requirements
✅ Proposal submission with fee calculator
✅ Delay penalty system
✅ Proposal approval workflow
✅ Contract creation and management
✅ In-app messaging system
✅ Payment tracking and release
✅ Freelancer discovery with filters
✅ Admin verification toggle (demo mode)

## 🔧 Customization

### Modify Platform Fee
Edit in proposal submission components:
```typescript
const platformFee = price * 0.1  // Change 0.1 to desired percentage
```

### Add More Roles/Skills
Insert directly into Supabase:
```sql
INSERT INTO roles (name, description) VALUES
  ('New Role', 'Description here');

INSERT INTO skills (name, category) VALUES
  ('New Skill', 'Category');
```

### Modify Delay Penalty
Edit in proposal modal:
```typescript
const delayPenalty = 1000  // PKR per day
```

## 📚 Project Structure

```
kasab-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── freelancer/
│   │   ├── onboarding/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── tabs/
│   ├── client/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── tabs/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── database.types.ts
├── supabase-schema.sql
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### "Invalid email or password"
- Ensure user was created in Supabase Auth
- Check that profile was created in users table

### "Cannot submit proposal"
- Verify freelancer verification_status is 'verified'
- Use admin toggle to switch from 'pending'

### RLS Errors
- Ensure all policies are created from schema
- Check user is authenticated
- Verify user_id matches in profiles

## 📄 License

This is a beta product demonstration. Built for educational and portfolio purposes.

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

**Kasab** - Empowering Pakistani freelancers, one project at a time.
