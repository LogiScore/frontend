CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freight_forwarder_id UUID REFERENCES freight_forwarders(id) ON DELETE CASCADE,
    branch_name VARCHAR(255),
    address TEXT,
    country CHAR(2),
    unlocode VARCHAR(10),
    region VARCHAR(50),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
