# 🚨 URGENT BACKEND REQUEST: Fix Admin Reviews Endpoint

## To: Backend Development Team
## From: Frontend Development Team  
## Date: January 15, 2025
## Priority: 🚨 CRITICAL

---

## Issue Summary
The `/admin/reviews` endpoint is returning company IDs instead of company names, and missing the `shipment_reference` field. This is causing the admin dashboard to display unreadable data.

## Current Problem
**Frontend is showing:**
```
Company: Company ID: 7120060b-1234-5678-9abc-def012345678
Branch: N/A
Reviewer: Anonymous
Shipment Reference: N/A
Status: active
Date: 17/08/2025
```

**Should be showing:**
```
Company: DHL Supply Chain
Branch: Main Office  
Reviewer: Anonymous
Shipment Reference: SHIP-2025-001234
Status: active
Date: 17/08/2025
```

## Required Changes

### 1. Fix Company Name Join
**File:** `routes/admin.py` (around line 211)

**Current Issue:** The endpoint is returning `freight_forwarder_id` as `freight_forwarder_name`

**Required Fix:** Join with `freight_forwarders` table to get actual company names

```python
# Current query (estimated)
query = """
SELECT r.*, r.freight_forwarder_id as freight_forwarder_name
FROM reviews r
"""

# Required query
query = """
SELECT 
    r.id,
    r.freight_forwarder_id,
    ff.name as freight_forwarder_name,
    r.branch_name,
    r.reviewer_name,
    r.shipment_reference,
    r.status,
    r.created_at
FROM reviews r
LEFT JOIN freight_forwarders ff ON r.freight_forwarder_id = ff.id
"""
```

### 2. Include Shipment Reference Field
**Add `shipment_reference` to the response:**

```python
# In the response mapping
review_data = {
    "id": review.id,
    "freight_forwarder_id": review.freight_forwarder_id,
    "freight_forwarder_name": review.freight_forwarder_name,  # From JOIN
    "branch_name": review.branch_name,
    "reviewer_name": review.reviewer_name,
    "shipment_reference": review.shipment_reference,  # Add this field
    "status": review.status,
    "created_at": review.created_at.isoformat()
}
```

### 3. Verify Database Schema
**Check if `shipment_reference` field exists in reviews table:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'shipment_reference';
```

If missing, add the field:
```sql
ALTER TABLE reviews ADD COLUMN shipment_reference VARCHAR(255);
```

## Expected Response Format
```json
[
  {
    "id": "uuid",
    "freight_forwarder_id": "7120060b-1234-5678-9abc-def012345678",
    "freight_forwarder_name": "DHL Supply Chain",
    "branch_name": "Main Office",
    "reviewer_name": "John Doe",
    "shipment_reference": "SHIP-2025-001234",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

## Testing Requirements
1. **Verify company names** are displayed correctly (not IDs)
2. **Verify shipment references** are included when available
3. **Test with null values** for optional fields
4. **Performance test** with large datasets

## Frontend Status
✅ **Frontend is ready** - All changes have been implemented and pushed to `frontend/main`
- Shipment reference column added
- Company name resolution with fallback logic
- Debug logging added to verify API responses

## Timeline
**Requested completion:** ASAP (blocking admin dashboard functionality)

## Contact
If you need any clarification or have questions about the frontend implementation, please reach out to the frontend team.

---
**This is a critical issue affecting the admin dashboard user experience.**
