CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255),
    target_region VARCHAR(50),
    target_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    ad_type VARCHAR(20) CHECK (ad_type IN ('banner', 'sidebar', 'feature_box')),
    start_date DATE,
    end_date DATE,
    image_url TEXT,
    cta_link TEXT,
    active BOOLEAN DEFAULT TRUE
);
