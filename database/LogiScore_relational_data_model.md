## 🧱 ENTITY RELATIONSHIP OVERVIEW

### 1. **User**

Represents a shipper (reviewer) or admin.

| Field                 | Type      | Notes                           |
| --------------------- | --------- | ------------------------------- |
| `id`                  | UUID      | Primary key                     |
| `name`                | String    | Optional if anonymous           |
| `email`               | String    | Nullable if anonymous           |
| `company_name`        | String    | Shipper company                 |
| `role`                | Enum      | `shipper`, `admin`, `moderator` |
| `verified`            | Boolean   | True if identity confirmed      |
| `subscription_status` | Enum      | `free`, `insights`, `expired`   |
| `ip_address`          | String    | For fraud detection             |
| `created_at`          | Timestamp |                                 |
| `is_banned`           | Boolean   |                                 |

---

### 2. **FreightForwarder**

Represents the corporate identity (e.g., DHL Global Forwarding).

| Field        | Type      | Notes                       |
| ------------ | --------- | --------------------------- |
| `id`         | UUID      | Primary key                 |
| `name`       | String    | Company name (standardized) |
| `website`    | String    | Optional                    |
| `logo_url`   | String    | Optional                    |
| `created_at` | Timestamp |                             |

---

### 3. **Branch**

Represents a specific physical branch of a forwarder.

| Field                  | Type                     | Notes                     |
| ---------------------- | ------------------------ | ------------------------- |
| `id`                   | UUID                     | Primary key               |
| `freight_forwarder_id` | FK → FreightForwarder.id |                           |
| `branch_name`          | String                   | e.g., "Singapore HQ"      |
| `address`              | Text                     | Full address              |
| `country`              | String                   | ISO2 or ISO3              |
| `unlocode`             | String                   | UNLOCODE of city/port     |
| `region`               | String                   | For regional ad targeting |
| `lat`, `lng`           | Float                    | Optional, for mapping     |
| `created_at`           | Timestamp                |                           |

---

### 4. **Review**

Stores a single review submission, per shipper, per branch.

| Field           | Type           | Notes                             |
| --------------- | -------------- | --------------------------------- |
| `id`            | UUID           | Primary key                       |
| `user_id`       | FK → User.id   | Nullable for anonymous            |
| `branch_id`     | FK → Branch.id |                                   |
| `review_date`   | Timestamp      |                                   |
| `overall_score` | Decimal        | Weighted avg of 7 categories      |
| `is_anonymous`  | Boolean        | If true, weight = 0.5             |
| `review_text`   | Text           |                                   |
| `ip_address`    | String         | Snapshot of source IP             |
| `source`        | Enum           | `web`, `email`, `api`             |
| `status`        | Enum           | `active`, `flagged`, `removed`    |
| `weight`        | Float          | 0.5 (anonymous) or 1.0 (verified) |

---

### 5. **ReviewCategoryScore**

Stores detailed ratings per review across 7 dimensions.

| Field       | Type            | Notes                                                                                                             |
| ----------- | --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `id`        | UUID            |                                                                                                                   |
| `review_id` | FK → Review\.id |                                                                                                                   |
| `category`  | Enum            | `communication`, `reliability`, `timeliness`, `pricing`, `compliance`, `transport_quality`, `financial_stability` |
| `score`     | Integer         | 1–5                                                                                                               |

---

### 6. **Dispute**

Tracks moderation activity or disputes initiated by forwarders.

| Field              | Type            | Notes                              |
| ------------------ | --------------- | ---------------------------------- |
| `id`               | UUID            |                                    |
| `review_id`        | FK → Review\.id |                                    |
| `status`           | Enum            | `pending`, `resolved`, `dismissed` |
| `flagged_by`       | String          | email or admin                     |
| `reason`           | Text            |                                    |
| `resolution_notes` | Text            | optional                           |
| `created_at`       | Timestamp       |                                    |
| `resolved_at`      | Timestamp       |                                    |

---

### 7. **AdCampaign**

For paid advertisements linked to branch/country.

| Field                    | Type           | Notes                              |
| ------------------------ | -------------- | ---------------------------------- |
| `id`                     | UUID           |                                    |
| `company_name`           | String         | Forwarder running ad               |
| `target_region`          | String         | e.g., `SG`, `DE`, `SEA`, `Global`  |
| `target_branch_id`       | FK → Branch.id | Optional                           |
| `ad_type`                | Enum           | `banner`, `sidebar`, `feature_box` |
| `start_date`, `end_date` | Timestamp      |                                    |
| `image_url`              | String         |                                    |
| `cta_link`               | String         |                                    |
| `active`                 | Boolean        |                                    |

---

## 🧮 Calculations & Logic

* **Branch Score** = `avg(weighted overall_score)` for all `active` reviews
* **Verified vs. Anonymous Weighting**: `weight = 1.0` vs. `0.5`
* **Cooldown Rule**: One review per shipper per branch every 90 days
* **Subscription Gating**:

  * Free: Can submit, view overall score
  * Insights: View review text + category scores

---

Would you like me to:

* Convert this into an **ERD diagram**?
* Generate the **PostgreSQL schema**?
* Build a **dummy dataset for testing**?

Let me know what step you'd like next.
