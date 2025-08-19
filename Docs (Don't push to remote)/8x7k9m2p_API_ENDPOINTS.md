# 8x7k9m2p API Endpoints Required by Frontend

## Overview
The LogiScore frontend 8x7k9m2p dashboard requires these backend API endpoints to function properly. Currently, the frontend falls back to mock data when these endpoints are not available.

## Required Endpoints

### 1. Dashboard Statistics
**Endpoint:** `GET /admin/dashboard`  
**Purpose:** Get overall platform statistics for 8x7k9m2p dashboard  
**Headers:** `Authorization: Bearer {token}`  
**Response:**
```json
{
  "total_users": 1250,
  "total_companies": 89,
  "total_reviews": 3420,
  "pending_disputes": 12,
  "pending_reviews": 8,
  "total_revenue": 15600
}
```

### 2. Recent Activity
**Endpoint:** `GET /admin/recent-activity`  
**Purpose:** Get recent platform activities for 8x7k9m2p dashboard  
**Headers:** `Authorization: Bearer {token}`  
**Response:**
```json
[
  {
    "id": "1",
    "type": "review",
    "message": "New review submitted for DHL Supply Chain",
    "timestamp": "2025-01-15T10:30:00Z",
    "company_name": "DHL Supply Chain",
    "user_name": "John Doe"
  },
  {
    "id": "2",
    "type": "dispute",
    "message": "Dispute opened for Kuehne + Nagel review",
    "timestamp": "2025-01-15T08:45:00Z",
    "company_name": "Kuehne + Nagel",
    "user_name": "Jane Smith"
  }
]
```

### 3. User Management
**Endpoint:** `GET /admin/users`  
**Purpose:** Get list of users for 8x7k9m2p management  
**Headers:** `Authorization: Bearer {token}`  
**Query Parameters:**
- `search` (optional): Search users by name/email
- `filter` (optional): Filter by user type (shipper, forwarder, admin)
**Response:**
```json
[
  {
    "id": "1",
    "username": "john_doe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "user_type": "shipper",
    "subscription_tier": "premium",
    "is_active": true
  }
]
```

### 4. Review Management
**Endpoint:** `GET /admin/reviews`  
**Purpose:** Get list of reviews for 8x7k9m2p approval/moderation  
**Headers:** `Authorization: Bearer {token}`  
**Query Parameters:**
- `status` (optional): Filter by review status (pending, approved, rejected)
**Response:**
```json
[
  {
    "id": "1",
    "freight_forwarder_name": "DHL Supply Chain",
    "branch_name": "Main Office",
    "reviewer_name": "John Doe",
    "status": "pending",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

### 5. Dispute Management
**Endpoint:** `GET /admin/disputes`  
**Purpose:** Get list of disputes for 8x7k9m2p resolution  
**Headers:** `Authorization: Bearer {token}`  
**Query Parameters:**
- `status` (optional): Filter by dispute status (open, under_review, resolved)
**Response:**
```json
[
  {
    "id": "1",
    "freight_forwarder_name": "Kuehne + Nagel",
    "issue": "Incorrect rating calculation",
    "status": "open",
    "created_at": "2025-01-15T08:45:00Z"
  }
]
```

### 6. Company Management
**Endpoint:** `GET /admin/companies`  
**Purpose:** Get list of companies for 8x7k9m2p management  
**Headers:** `Authorization: Bearer {token}`  
**Query Parameters:**
- `search` (optional): Search companies by name
**Response:**
```json
[
  {
    "id": "1",
    "name": "DHL Supply Chain",
    "logo_url": "https://example.com/logo.png",
    "branches_count": 5,
    "reviews_count": 156,
    "status": "active"
  }
]
```

### 7. Analytics Data
**Endpoint:** `GET /admin/analytics`  
**Purpose:** Get platform analytics for 8x7k9m2p dashboard  
**Headers:** `Authorization: Bearer {token}`  
**Response:**
```json
{
  "review_growth": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [65, 78, 90, 85, 95, 120]
  },
  "user_engagement": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [1200, 1350, 1420, 1380, 1500, 1680]
  },
  "revenue_metrics": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [2500, 3200, 3800, 3500, 4200, 4800]
  },
  "top_companies": [
    {
      "name": "DHL Supply Chain",
      "reviews": 156,
      "rating": 4.2
    }
  ]
}
```

## Action Endpoints

### 8. Review Actions
**Endpoint:** `POST /admin/reviews/{review_id}/approve`  
**Purpose:** Approve a pending review  
**Headers:** `Authorization: Bearer {token}`

**Endpoint:** `POST /admin/reviews/{review_id}/reject`  
**Purpose:** Reject a pending review  
**Headers:** `Authorization: Bearer {token}`

### 9. Dispute Actions
**Endpoint:** `POST /admin/disputes/{dispute_id}/resolve`  
**Purpose:** Mark a dispute as resolved  
**Headers:** `Authorization: Bearer {token}`

### 10. User Subscription Management
**Endpoint:** `PUT /admin/users/{user_id}/subscription`  
**Purpose:** Update user subscription details  
**Headers:** `Authorization: Bearer {token}`  
**Body:**
```json
{
  "tier": "premium",
  "comment": "Upgraded to premium plan",
  "duration": 12,
  "is_paid": true
}
```

### 11. Company Creation
**Endpoint:** `POST /admin/companies`  
**Purpose:** Create a new company  
**Headers:** `Authorization: Bearer {token}`  
**Body:**
```json
{
  "name": "New Company Name",
  "website": "https://example.com",
  "description": "Company description",
  "headquarters_country": "United States"
}
```

## Authentication Endpoints

### 12. Admin Verification Code
**Endpoint:** `POST /api/users/admin/send-verification-code`  
**Purpose:** Send verification code to admin email  
**Body:** `{"email": "admin@example.com"}`

**Endpoint:** `POST /api/users/admin/verify-code`  
**Purpose:** Verify admin code and authenticate  
**Body:** `{"email": "admin@example.com", "code": "123456"}`

## Implementation Priority

### High Priority (Core Functionality)
1. `GET /admin/dashboard` - 8x7k9m2p dashboard statistics
2. `GET /admin/users` - 8x7k9m2p user management
3. `GET /admin/reviews` - 8x7k9m2p review management
4. `POST /admin/reviews/{id}/approve` - 8x7k9m2p review approval
5. `POST /admin/reviews/{id}/reject` - 8x7k9m2p review rejection

### Medium Priority (Enhanced Features)
1. `GET /admin/recent-activity` - 8x7k9m2p recent activity feed
2. `GET /admin/disputes` - 8x7k9m2p dispute management
3. `POST /admin/disputes/{id}/resolve` - 8x7k9m2p dispute resolution
4. `GET /admin/companies` - 8x7k9m2p company management
5. `POST /admin/companies` - 8x7k9m2p company creation

### Low Priority (Advanced Analytics)
1. `GET /admin/analytics` - 8x7k9m2p platform analytics
2. `PUT /admin/users/{id}/subscription` - 8x7k9m2p subscription management

## Notes

- All endpoints require valid 8x7k9m2p authentication via Bearer token
- The frontend currently provides comprehensive fallback data for demo purposes
- Implement endpoints in order of priority to enable core 8x7k9m2p functionality
- Consider implementing pagination for list endpoints (users, reviews, disputes, companies)
- All timestamps should be in ISO 8601 format
- Error responses should include meaningful error messages and appropriate HTTP status codes
