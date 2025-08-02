CREATE TABLE review_category_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    category VARCHAR(50) CHECK (category IN (
        'communication', 'reliability', 'timeliness',
        'pricing', 'compliance', 'transport_quality',
        'financial_stability'
    )),
    score INTEGER CHECK (score BETWEEN 1 AND 5)
);
