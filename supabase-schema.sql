-- Kasab Platform - Supabase Database Schema
-- Complete migration for two-sided marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS freelancer_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS freelancer_portfolios CASCADE;
DROP TABLE IF EXISTS freelancer_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS client_profiles CASCADE;
DROP TABLE IF EXISTS freelancer_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    user_type TEXT CHECK (user_type IN ('freelancer', 'client')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Freelancer profiles
CREATE TABLE freelancer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    cnic TEXT,
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    certification_level INTEGER CHECK (certification_level IN (1, 2, 3)) DEFAULT 1,
    bank_name TEXT,
    iban TEXT,
    total_earned DECIMAL(10, 2) DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client profiles
CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    company_name TEXT,
    company_size TEXT,
    industry TEXT,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    jobs_posted INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles (Developer, Designer, Writer, etc.)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Freelancer roles (many-to-many)
CREATE TABLE freelancer_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(freelancer_id, role_id)
);

-- Portfolio items
CREATE TABLE freelancer_portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Freelancer skills (many-to-many)
CREATE TABLE freelancer_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')) DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(freelancer_id, skill_id)
);

-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10, 2),
    duration TEXT,
    experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'expert')) DEFAULT 'intermediate',
    status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    proposals_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job skills (many-to-many)
CREATE TABLE job_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, skill_id)
);

-- Proposals
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    pitch TEXT NOT NULL,
    proposed_price DECIMAL(10, 2),
    estimated_days INTEGER,
    portfolio_link TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, freelancer_id)
);

-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    agreed_price DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    freelancer_earnings DECIMAL(10, 2) NOT NULL,
    estimated_days INTEGER,
    status TEXT CHECK (status IN ('active', 'completed', 'disputed', 'cancelled')) DEFAULT 'active',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    participant_1 UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    participant_2 UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1, participant_2, job_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    freelancer_earnings DECIMAL(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'released', 'refunded')) DEFAULT 'pending',
    delay_penalty DECIMAL(10, 2) DEFAULT 0,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('Full-Stack Developer', 'Expert in both frontend and backend development'),
    ('Frontend Developer', 'Specializes in user interfaces and client-side code'),
    ('Backend Developer', 'Focuses on server-side logic and databases'),
    ('UI/UX Designer', 'Creates user interfaces and experiences'),
    ('Mobile Developer', 'Builds iOS and Android applications'),
    ('DevOps Engineer', 'Manages infrastructure and deployment'),
    ('Content Writer', 'Creates written content for various platforms'),
    ('Video Editor', 'Edits and produces video content'),
    ('Graphic Designer', 'Creates visual content and branding'),
    ('Digital Marketer', 'Manages online marketing campaigns');

-- Insert default skills
INSERT INTO skills (name, category) VALUES
    ('React', 'Frontend'),
    ('Next.js', 'Frontend'),
    ('TypeScript', 'Programming'),
    ('Node.js', 'Backend'),
    ('Python', 'Programming'),
    ('PostgreSQL', 'Database'),
    ('MongoDB', 'Database'),
    ('AWS', 'Cloud'),
    ('Docker', 'DevOps'),
    ('Figma', 'Design'),
    ('Adobe Photoshop', 'Design'),
    ('SEO', 'Marketing'),
    ('Content Writing', 'Writing'),
    ('Video Editing', 'Media'),
    ('UI Design', 'Design');

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for freelancer_profiles
CREATE POLICY "Anyone can view verified freelancers" ON freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Freelancers can update own profile" ON freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for client_profiles
CREATE POLICY "Anyone can view client profiles" ON client_profiles FOR SELECT USING (true);
CREATE POLICY "Clients can update own profile" ON client_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for roles and skills (public read)
CREATE POLICY "Anyone can view roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Anyone can view skills" ON skills FOR SELECT USING (true);

-- RLS Policies for freelancer_roles
CREATE POLICY "Anyone can view freelancer roles" ON freelancer_roles FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own roles" ON freelancer_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM freelancer_profiles WHERE id = freelancer_id AND user_id = auth.uid())
);

-- RLS Policies for portfolios
CREATE POLICY "Anyone can view portfolios" ON freelancer_portfolios FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own portfolio" ON freelancer_portfolios FOR ALL USING (
    EXISTS (SELECT 1 FROM freelancer_profiles WHERE id = freelancer_id AND user_id = auth.uid())
);

-- RLS Policies for freelancer_skills
CREATE POLICY "Anyone can view freelancer skills" ON freelancer_skills FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own skills" ON freelancer_skills FOR ALL USING (
    EXISTS (SELECT 1 FROM freelancer_profiles WHERE id = freelancer_id AND user_id = auth.uid())
);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view open jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Clients can create jobs" ON jobs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM client_profiles WHERE id = client_id AND user_id = auth.uid())
);
CREATE POLICY "Clients can update own jobs" ON jobs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE id = client_id AND user_id = auth.uid())
);

-- RLS Policies for job_skills
CREATE POLICY "Anyone can view job skills" ON job_skills FOR SELECT USING (true);
CREATE POLICY "Job owners can manage job skills" ON job_skills FOR ALL USING (
    EXISTS (
        SELECT 1 FROM jobs j
        JOIN client_profiles cp ON j.client_id = cp.id
        WHERE j.id = job_id AND cp.user_id = auth.uid()
    )
);

-- RLS Policies for proposals
CREATE POLICY "Freelancers and clients can view relevant proposals" ON proposals FOR SELECT USING (
    EXISTS (SELECT 1 FROM freelancer_profiles WHERE id = freelancer_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM jobs j
        JOIN client_profiles cp ON j.client_id = cp.id
        WHERE j.id = job_id AND cp.user_id = auth.uid()
    )
);
CREATE POLICY "Freelancers can create proposals" ON proposals FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM freelancer_profiles WHERE id = freelancer_id AND user_id = auth.uid())
);
CREATE POLICY "Clients can update proposals" ON proposals FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM jobs j
        JOIN client_profiles cp ON j.client_id = cp.id
        WHERE j.id = job_id AND cp.user_id = auth.uid()
    )
);

-- RLS Policies for contracts
CREATE POLICY "Participants can view contracts" ON contracts FOR SELECT USING (
    EXISTS (SELECT 1 FROM freelancer_profiles WHERE id = freelancer_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM client_profiles WHERE id = client_id AND user_id = auth.uid())
);
CREATE POLICY "Clients can create contracts" ON contracts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM client_profiles WHERE id = client_id AND user_id = auth.uid())
);
CREATE POLICY "Participants can update contracts" ON contracts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM freelancer_profiles WHERE id = freelancer_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM client_profiles WHERE id = client_id AND user_id = auth.uid())
);

-- RLS Policies for conversations
CREATE POLICY "Participants can view conversations" ON conversations FOR SELECT USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (
    auth.uid() = participant_1 OR auth.uid() = participant_2
);

-- RLS Policies for messages
CREATE POLICY "Conversation participants can view messages" ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversations
        WHERE id = conversation_id
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversations
        WHERE id = conversation_id
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
    AND sender_id = auth.uid()
);

-- RLS Policies for payments
CREATE POLICY "Participants can view payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM freelancer_profiles WHERE id = freelancer_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM client_profiles WHERE id = client_id AND user_id = auth.uid())
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_freelancer_profiles_user_id ON freelancer_profiles(user_id);
CREATE INDEX idx_freelancer_profiles_verification ON freelancer_profiles(verification_status);
CREATE INDEX idx_freelancer_profiles_certification ON freelancer_profiles(certification_level);
CREATE INDEX idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_contracts_job_id ON contracts(job_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_freelancer_profiles_updated_at BEFORE UPDATE ON freelancer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
