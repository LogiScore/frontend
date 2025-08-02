-- LogiScore Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company_name VARCHAR(255),
    hashed_password VARCHAR(255),
    user_type VARCHAR(20) CHECK (user_type IN ('shipper', 'forwarder', 'admin')) DEFAULT 'shipper',
    subscription_tier VARCHAR(20) DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freight_forwarders table
CREATE TABLE IF NOT EXISTS freight_forwarders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    logo_url TEXT,
    description TEXT,
    headquarters_country VARCHAR(100),
    global_rank INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freight_forwarder_id UUID REFERENCES freight_forwarders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    freight_forwarder_id UUID REFERENCES freight_forwarders(id) ON DELETE CASCADE,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    responsiveness_rating INTEGER CHECK (responsiveness_rating >= 1 AND responsiveness_rating <= 5),
    documentation_rating INTEGER CHECK (documentation_rating >= 1 AND documentation_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    cost_effectiveness_rating INTEGER CHECK (cost_effectiveness_rating >= 1 AND cost_effectiveness_rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_category_scores table
CREATE TABLE IF NOT EXISTS review_category_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    freight_forwarder_id UUID REFERENCES freight_forwarders(id) ON DELETE CASCADE,
    dispute_type VARCHAR(50) CHECK (dispute_type IN ('inaccurate', 'fake', 'inappropriate', 'other')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad_campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freight_forwarder_id UUID REFERENCES freight_forwarders(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) CHECK (campaign_type IN ('banner', 'featured', 'premium')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_reviews_branch_id ON reviews(branch_id);
CREATE INDEX IF NOT EXISTS idx_reviews_freight_forwarder_id ON reviews(freight_forwarder_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_branches_freight_forwarder_id ON branches(freight_forwarder_id);
CREATE INDEX IF NOT EXISTS idx_disputes_review_id ON disputes(review_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_forwarders ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_category_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for freight_forwarders table (public read access)
CREATE POLICY "Anyone can view freight forwarders" ON freight_forwarders
    FOR SELECT USING (true);

-- Create RLS policies for branches table (public read access)
CREATE POLICY "Anyone can view branches" ON branches
    FOR SELECT USING (true);

-- Create RLS policies for reviews table
CREATE POLICY "Anyone can view active reviews" ON reviews
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for disputes table
CREATE POLICY "Users can view their own disputes" ON disputes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create disputes" ON disputes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for user_sessions table
CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for ad_campaigns table (admin only)
CREATE POLICY "Only admins can manage ad campaigns" ON ad_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'admin'
        )
    );

-- Insert some sample freight forwarders
INSERT INTO freight_forwarders (name, website, description, headquarters_country, global_rank) VALUES
('DHL Supply Chain', 'https://www.dhl.com', 'Global logistics leader', 'Germany', 1),
('Kuehne + Nagel', 'https://www.kuehne-nagel.com', 'International logistics company', 'Switzerland', 2),
('DB Schenker', 'https://www.dbschenker.com', 'Global logistics provider', 'Germany', 3),
('DSV', 'https://www.dsv.com', 'Transport and logistics', 'Denmark', 4),
('C.H. Robinson', 'https://www.chrobinson.com', 'Third-party logistics', 'United States', 5)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freight_forwarders_updated_at BEFORE UPDATE ON freight_forwarders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 