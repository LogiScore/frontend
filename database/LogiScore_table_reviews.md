CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    overall_score DECIMAL(2,1),
    is_anonymous BOOLEAN DEFAULT FALSE,
    review_text TEXT,
    ip_address INET,
    source VARCHAR(10) CHECK (source IN ('web', 'email', 'api')),
    status VARCHAR(10) CHECK (status IN ('active', 'flagged', 'removed')) DEFAULT 'active',
    weight DECIMAL(2,1) DEFAULT 1.0
);
