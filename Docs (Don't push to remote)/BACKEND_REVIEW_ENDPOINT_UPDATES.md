# 🚨 URGENT: Backend Review Endpoint Updates Required

## Overview
The frontend Review Management page is currently showing **Company ID: 7120060b...** instead of actual company names, and shipment references are showing as "N/A". This is a **HIGH PRIORITY** issue affecting the admin dashboard functionality.

## 🚨 Current Issue Status
**CRITICAL:** The `/admin/reviews` endpoint is not properly joining with the freight_forwarders table and is missing the shipment_reference field.

**Current Display:**
```
Company: Company ID: 7120060b...
Branch: N/A  
Reviewer: Anonymous
Shipment Reference: N/A
Status: active
Date: 17/08/2025
```

**Expected Display:**
```
Company: DHL Supply Chain
Branch: Main Office
Reviewer: Anonymous  
Shipment Reference: SHIP-2025-001234
Status: active
Date: 17/08/2025
```

## Current Issues

### 1. Company Name Display Issue
**Problem:** The Review Management page shows "Company ID: 7120060b..." instead of actual company names.

**Root Cause:** The `/admin/reviews` endpoint is not properly joining with the `freight_forwarders` table to include the company name.

**Current Response:**
```json
{
  "id": "1",
  "freight_forwarder_name": "7120060b-1234-5678-9abc-def012345678", // This is an ID, not a name
  "branch_name": "Main Office",
  "reviewer_name": "John Doe",
  "status": "pending",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Required Response:**
```json
{
  "id": "1",
  "freight_forwarder_id": "7120060b-1234-5678-9abc-def012345678",
  "freight_forwarder_name": "DHL Supply Chain", // Actual company name from freight_forwarders table
  "branch_name": "Main Office",
  "reviewer_name": "John Doe",
  "status": "pending",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### 2. Missing Shipment Reference
**Problem:** The frontend needs to display shipment reference information for reviews.

**Required Addition:** Include `shipment_reference` field in the response.

**Updated Response:**
```json
{
  "id": "1",
  "freight_forwarder_id": "7120060b-1234-5678-9abc-def012345678",
  "freight_forwarder_name": "DHL Supply Chain",
  "branch_name": "Main Office",
  "reviewer_name": "John Doe",
  "shipment_reference": "SHIP-2025-001234", // New field needed
  "status": "pending",
  "created_at": "2025-01-15T10:30:00Z"
}
```

## Required Backend Changes

### 1. Update `/admin/reviews` Endpoint
**File:** `routes/admin.py` (around line 211)

**Changes Needed:**
1. **Join with freight_forwarders table** to get company names
2. **Include shipment_reference field** in the response
3. **Ensure proper field mapping** between database and API response

**SQL Query Update:**
```sql
-- Current query (estimated)
SELECT r.*, ff.name as freight_forwarder_name
FROM reviews r
LEFT JOIN freight_forwarders ff ON r.freight_forwarder_id = ff.id

-- Should include:
-- - r.shipment_reference
-- - ff.name as freight_forwarder_name (not ff.id)
-- - Proper field selection for all required fields
```

### 2. Database Schema Verification
**Check if `shipment_reference` field exists in reviews table:**
- If missing, add the field to the reviews table
- Ensure it's properly indexed for performance

### 3. Response Format Update
**Update the endpoint response to include:**
- `freight_forwarder_id`: The UUID of the freight forwarder
- `freight_forwarder_name`: The actual company name (not the ID)
- `shipment_reference`: The shipment reference if available
- All existing fields (id, branch_name, reviewer_name, status, created_at)

## Testing Requirements

### 1. Verify Company Names
- Test that company names are displayed correctly (not IDs)
- Ensure all reviews show proper company names

### 2. Verify Shipment References
- Test that shipment references are displayed when available
- Ensure "N/A" is shown when shipment reference is null/empty

### 3. Performance Testing
- Ensure the JOIN with freight_forwarders table doesn't impact performance
- Test with large datasets

## Frontend Changes Made

### 1. Added Shipment Reference Column
- Added "Shipment Reference" column to Review Management table
- Displays `review.shipment_reference || 'N/A'`

### 2. Enhanced Company Name Resolution
- Added `getCompanyName()` function for fallback company name resolution
- Loads companies data when reviews tab is active
- Provides fallback lookup if backend doesn't send proper names

## 🚨 IMMEDIATE ACTION REQUIRED

### Backend Team - Please Update `/admin/reviews` Endpoint:

1. **Fix Company Name Join:**
   ```sql
   SELECT r.*, ff.name as freight_forwarder_name, ff.id as freight_forwarder_id
   FROM reviews r
   LEFT JOIN freight_forwarders ff ON r.freight_forwarder_id = ff.id
   ```

2. **Include Shipment Reference:**
   ```sql
   SELECT r.*, r.shipment_reference, ff.name as freight_forwarder_name
   FROM reviews r
   LEFT JOIN freight_forwarders ff ON r.freight_forwarder_id = ff.id
   ```

3. **Update Response Format:**
   ```json
   {
     "id": "uuid",
     "freight_forwarder_id": "uuid", 
     "freight_forwarder_name": "DHL Supply Chain", // NOT the ID!
     "branch_name": "Main Office",
     "reviewer_name": "John Doe",
     "shipment_reference": "SHIP-2025-001234", // Include this field
     "status": "active",
     "created_at": "2025-01-15T10:30:00Z"
   }
   ```

## Priority
**🚨 CRITICAL** - This is blocking the admin dashboard functionality and user experience.

## Implementation Notes
- The frontend is already prepared to handle the updated response format
- Company name resolution has fallback logic in place
- Shipment reference column is ready to display data once backend provides it
