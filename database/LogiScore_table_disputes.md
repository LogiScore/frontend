CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
    flagged_by VARCHAR(255),
    reason TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
