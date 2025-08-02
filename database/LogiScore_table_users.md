CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    company_name VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('shipper', 'admin', 'moderator')),
    verified BOOLEAN DEFAULT FALSE,
    subscription_status VARCHAR(20) CHECK (subscription_status IN ('free', 'insights', 'expired')),
    ip_address INET,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
