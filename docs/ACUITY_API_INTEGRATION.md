# Acuity Scheduling API Integration Documentation

> **Last Updated:** December 19, 2024
> **Author:** Generated for Gaya Therapy Practice
> **API Version:** v1

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Environment Setup](#environment-setup)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Webhooks](#webhooks)
6. [Current Appointment Types](#current-appointment-types)
7. [Current Calendars](#current-calendars)
8. [Code Examples](#code-examples)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## Overview

Acuity Scheduling is an appointment scheduling platform. This documentation covers the API integration for **Gaya Therapy** practice, enabling programmatic access to:

- Appointment management (create, read, update, cancel, reschedule)
- Availability checking (dates, times, classes)
- Calendar management
- Client management
- Webhooks for real-time notifications
- Products and certificates (packages/coupons)

**Base URL:** `https://acuityscheduling.com/api/v1`

**Official Documentation:** https://developers.acuityscheduling.com/reference/quick-start

---

## Authentication

### Method: HTTP Basic Authentication

Acuity uses HTTP Basic Auth over SSL. You need two credentials:

| Credential | Description | Where to Find |
|------------|-------------|---------------|
| **User ID** | Numeric identifier for your account | Acuity → Integrations → API section |
| **API Key** | Secret key for authentication | Acuity → Integrations → API section |

### How to Authenticate

The credentials are combined as `UserID:APIKey` and Base64 encoded in the `Authorization` header.

**Raw Header Format:**
```
Authorization: Basic base64(UserID:APIKey)
```

**cURL Example:**
```bash
curl -X GET "https://acuityscheduling.com/api/v1/appointments" \
  -u "USER_ID:API_KEY"
```

The `-u` flag in cURL automatically handles the Base64 encoding.

### Alternative: OAuth2 (for Multi-Account Apps)

If building an app that connects to multiple Acuity accounts, use OAuth2:

1. **Register your app:** https://acuityscheduling.com/oauth2/register

2. **Authorization URL:**
   ```
   https://acuityscheduling.com/oauth2/authorize?response_type=code&scope=api-v1&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI
   ```

3. **Token Exchange:**
   ```
   POST https://acuityscheduling.com/oauth2/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code&code=AUTH_CODE&redirect_uri=YOUR_URI&client_id=YOUR_ID&client_secret=YOUR_SECRET
   ```

4. **Use Token:**
   ```
   Authorization: Bearer ACCESS_TOKEN
   ```

---

## Environment Setup

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Acuity Scheduling API Credentials
# Found at: Acuity → Integrations → API section
ACUITY_USER_ID=29399858
ACUITY_API_KEY=7bf7b50fe31c72130fa17f077e4920d7

# Base URL (for convenience)
ACUITY_BASE_URL=https://acuityscheduling.com/api/v1
```

### Loading Environment Variables

**Node.js (with dotenv):**
```javascript
require('dotenv').config();

const ACUITY_USER_ID = process.env.ACUITY_USER_ID;
const ACUITY_API_KEY = process.env.ACUITY_API_KEY;
```

**Python:**
```python
from dotenv import load_dotenv
import os

load_dotenv()

ACUITY_USER_ID = os.getenv('ACUITY_USER_ID')
ACUITY_API_KEY = os.getenv('ACUITY_API_KEY')
```

### Security Notes

- **NEVER** commit `.env` files to version control
- Add `.env` to your `.gitignore` file
- API calls must be made server-side only (not from browser/client)
- Use HTTPS exclusively

---

## API Endpoints Reference

### Appointments

#### List Appointments
```
GET /appointments
```

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `canceled=true` | Returns only canceled appointments |
| `showall=true` | Returns both canceled and scheduled appointments |
| `minDate` | Filter by minimum date (ISO 8601) |
| `maxDate` | Filter by maximum date (ISO 8601) |
| `calendarID` | Filter by calendar |
| `appointmentTypeID` | Filter by appointment type |

**Example:**
```bash
curl -s -X GET "https://acuityscheduling.com/api/v1/appointments?minDate=2024-12-01" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"
```

#### Get Single Appointment
```
GET /appointments/{id}
```

**Response includes:**
- `noShow` (boolean) - True if marked no-show by admin
- `scheduledBy` - Username who scheduled (null if anonymous)

#### Create Appointment
```
POST /appointments
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `datetime` | string | ISO 8601 format with timezone |
| `appointmentTypeID` | integer | Valid appointment type ID |
| `firstName` | string | Client's first name |
| `lastName` | string | Client's last name |
| `email` | string | Valid email address |

**Optional Fields:**
| Field | Description |
|-------|-------------|
| `phone` | Client phone number |
| `calendarID` | Specific calendar (required if admin=true) |
| `certificate` | Coupon/package code |
| `fields` | Custom form field values |
| `addonIDs` | Array of addon service IDs |
| `labels` | Array with single label object |
| `notes` | Appointment notes (admin only) |

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `admin=true` | Bypass availability checks, requires calendarID |
| `noEmail=true` | Suppress confirmation emails/SMS |

**Example:**
```bash
curl -X POST "https://acuityscheduling.com/api/v1/appointments?admin=true" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7" \
  -H "Content-Type: application/json" \
  -d '{
    "datetime": "2024-12-20T10:00:00-0500",
    "appointmentTypeID": 79891463,
    "calendarID": 11791930,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'
```

#### Update Appointment
```
PUT /appointments/{id}
```

**Updatable Fields Only:**
- `firstName`, `lastName`, `phone`, `email`
- `certificate`, `fields`, `notes`, `labels`, `smsOptIn`

**Note:** Use separate endpoints for rescheduling and canceling.

**Query Parameters:**
- `admin=true` - Bypass validations

#### Cancel Appointment
```
PUT /appointments/{id}/cancel
```

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `admin=true` | Bypass cancellation rules, allows setting noShow |
| `noEmail=true` | Suppress cancellation notifications |

**Body (optional with admin=true):**
```json
{
  "noShow": true
}
```

#### Reschedule Appointment
```
PUT /appointments/{id}/reschedule
```

**Required Fields:**
| Field | Description |
|-------|-------------|
| `datetime` | New date/time (ISO 8601) |

**Optional Fields:**
| Field | Description |
|-------|-------------|
| `calendarID` | Move to different calendar |

**Query Parameters:**
- `admin=true` - Bypass availability checks
- `noEmail=true` - Suppress notifications

---

### Availability

#### Get Available Dates
```
GET /availability/dates
```

Returns dates with availability for a specific month and appointment type.

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `appointmentTypeID` | Required - The appointment type to check |
| `month` | Month to check (YYYY-MM format) |
| `calendarID` | Filter by specific calendar |
| `timezone` | IANA timezone (e.g., "America/New_York") |

**Example:**
```bash
curl -s -X GET "https://acuityscheduling.com/api/v1/availability/dates?appointmentTypeID=79891463&month=2024-12" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"
```

#### Get Available Times
```
GET /availability/times
```

Returns available time slots for a specific date.

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `appointmentTypeID` | Required - The appointment type |
| `date` | Required - Date to check (YYYY-MM-DD) |
| `calendarID` | Filter by specific calendar |
| `timezone` | IANA timezone |

**Example:**
```bash
curl -s -X GET "https://acuityscheduling.com/api/v1/availability/times?appointmentTypeID=79891463&date=2024-12-20" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"
```

#### Get Available Classes
```
GET /availability/classes
```

Returns available classes for a month.

**Response Fields:**
| Field | Description |
|-------|-------------|
| `appointmentTypeID` | The appointment type |
| `calendarID` | Calendar hosting the class |
| `name` | Appointment type name |
| `time` | Class start time |
| `calendar` | Calendar name |
| `duration` | Length in minutes |
| `isSeries` | Boolean - requires full series enrollment |
| `slots` | Maximum capacity |
| `slotsAvailable` | Remaining spots |

---

### Calendars

#### List Calendars
```
GET /calendars
```

Returns all calendars the authenticated user has access to.

**Example:**
```bash
curl -s -X GET "https://acuityscheduling.com/api/v1/calendars" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"
```

---

### Appointment Types

#### List Appointment Types
```
GET /appointment-types
```

Returns all configured appointment types.

**Response Fields:**
| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `name` | Display name |
| `active` | Boolean - currently available |
| `description` | Description text |
| `duration` | Length in minutes |
| `price` | Cost (string, e.g., "0.00") |
| `category` | Category grouping |
| `color` | Hex color code |
| `private` | Boolean - hidden from public |
| `type` | "service" or "class" |
| `classSize` | Max attendees (classes only) |
| `paddingAfter` | Buffer time after (minutes) |
| `paddingBefore` | Buffer time before (minutes) |
| `calendarIDs` | Array of associated calendar IDs |
| `addonIDs` | Array of available addon IDs |
| `formIDs` | Array of intake form IDs |
| `schedulingUrl` | Direct booking URL |

---

### Blocks

#### List Blocks
```
GET /blocks
```

#### Create Block
```
POST /blocks
```

Block off time on a calendar.

**Fields:**
| Field | Description |
|-------|-------------|
| `start` | Start datetime |
| `end` | End datetime |
| `calendarID` | Calendar to block |
| `notes` | Optional notes |

#### Delete Block
```
DELETE /blocks/{id}
```

---

### Products & Certificates

#### List Products
```
GET /products
```

Returns products and packages.

**Response Fields:**
| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `name` | Product name |
| `description` | Product details |
| `price` | Cost in account currency |
| `type` | "product", "appointments", or "minutes" |
| `hidden` | Boolean - store visibility |
| `expires` | Days until expiration (null if none) |
| `appointmentTypeIDs` | Applicable appointment types |
| `appointmentTypeCounts` | Appointments per type (packages) |
| `minutes` | Total minutes (minute packages) |

#### List Certificates
```
GET /certificates
```

#### Check Certificate
```
GET /certificates/check?certificate=CODE
```

Validate a coupon or package code.

---

## Webhooks

Webhooks provide real-time notifications when events occur in Acuity.

### Event Types

| Event | Trigger |
|-------|---------|
| `appointment.scheduled` | New appointment booked |
| `appointment.rescheduled` | Appointment time changed |
| `appointment.canceled` | Appointment canceled |
| `appointment.changed` | ANY appointment modification (catch-all) |
| `order.completed` | Package/gift certificate/subscription order completed |

### Payload Format

Webhooks are sent as `application/x-www-form-urlencoded` POST requests:

```
action=scheduled&id=12345&calendarID=123&appointmentTypeID=456
```

**Fields:**
| Field | Description |
|-------|-------------|
| `action` | Event type |
| `id` | Appointment or order ID |
| `calendarID` | Calendar ID (appointments only) |
| `appointmentTypeID` | Appointment type ID (appointments only) |

### Setup Methods

#### 1. Static Webhooks (UI)

1. Log into Acuity Scheduling
2. Go to **Integrations**
3. Find **Webhooks** section
4. Add your callback URL
5. Select events to subscribe to

**Requirements:**
- URL must be accessible via HTTPS (port 443) or HTTP (port 80)

#### 2. Dynamic Webhooks (API)

**List Webhooks:**
```bash
curl -s -X GET "https://acuityscheduling.com/api/v1/webhooks" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"
```

**Create Webhook:**
```bash
curl -X POST "https://acuityscheduling.com/api/v1/webhooks" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "appointment.scheduled",
    "target": "https://your-server.com/webhook"
  }'
```

**Delete Webhook:**
```bash
curl -X DELETE "https://acuityscheduling.com/api/v1/webhooks/{id}" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"
```

### Security - Signature Verification

Acuity signs all webhooks using HMAC-SHA256. Always verify the signature!

**Header:** `x-acuity-signature`

**Verification Process:**
1. Get the raw request body
2. Compute HMAC-SHA256 hash using your API key as the secret
3. Base64 encode the hash
4. Compare with the `x-acuity-signature` header

**Node.js Example:**
```javascript
const crypto = require('crypto');

function verifyAcuityWebhook(rawBody, signature, apiKey) {
  const hash = crypto
    .createHmac('sha256', apiKey)
    .update(rawBody)
    .digest('base64');

  return hash === signature;
}

// Express.js middleware example
app.post('/webhook', express.raw({ type: '*/*' }), (req, res) => {
  const signature = req.headers['x-acuity-signature'];
  const isValid = verifyAcuityWebhook(req.body, signature, process.env.ACUITY_API_KEY);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook...
  res.status(200).send('OK');
});
```

**Python Example:**
```python
import hmac
import hashlib
import base64

def verify_acuity_webhook(raw_body: bytes, signature: str, api_key: str) -> bool:
    computed = base64.b64encode(
        hmac.new(
            api_key.encode(),
            raw_body,
            hashlib.sha256
        ).digest()
    ).decode()

    return hmac.compare_digest(computed, signature)
```

**PHP Example:**
```php
$body = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_ACUITY_SIGNATURE'];
$apiKey = getenv('ACUITY_API_KEY');

$hash = base64_encode(hash_hmac('sha256', $body, $apiKey, true));

if ($hash !== $signature) {
    http_response_code(401);
    exit('Invalid signature');
}
```

### Retry Logic

Failed webhooks retry with exponential backoff:

| Attempt | Delay After |
|---------|-------------|
| 1 | 2 seconds |
| 2 | 30 seconds |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 1 hour |
| 6 | 2 hours |
| 7 | 4 hours |
| 8 | 8 hours |
| 9 | 12 hours |

**Important Notes:**
- Retries only occur for HTTP 500 errors or connection failures
- HTTP 4xx errors are NOT retried (fix your endpoint!)
- Webhooks auto-disable after 5 days of continuous failures
- Must manually re-enable after auto-disable

### Current Webhook Status

As of December 19, 2024:

| ID | Event | Target | Status |
|----|-------|--------|--------|
| 893854 | appointment.scheduled | hook.us2.make.com/... | **Disabled** |

The Make.com webhook is disabled due to HTTP 410 (Gone) response.

---

## Current Appointment Types

These are the active appointment types configured for Gaya Therapy as of December 19, 2024:

### Hiring/Internal Appointments

| ID | Name | Duration | Padding | Calendar ID |
|----|------|----------|---------|-------------|
| 78674073 | Introduction Call with Shama Goklani, LCSW | 20 min | 10 min after | 12167984 |
| 79413867 | Clinical Interview | 60 min | 0 | 12167984 |
| 79745673 | Hiring Interview: Introduction with Gajan Gugendiran, LMHC | 20 min | 10 min after | - |
| 79745828 | Hiring Interview: Clinical Assessment with Gajan Gugendiran, LMHC | 75 min | 0 | - |
| 79745925 | Hiring Interview: Mock Supervision with Gajan Gugendiran, LMHC | 75 min | 0 | - |
| 79891463 | Hiring Introduction Call with Gaya Kodiyalam, LCSW, MPH | 30 min | 10 min after | 11791930 |

### Client Consultations (NY/NJ)

| ID | Name | Duration | Padding | Calendar ID | Form ID |
|----|------|----------|---------|-------------|---------|
| 82175241 | (NY/NJ) Consultation with Polly Mehta, MHC-LP | 10 min | 10 min after | 12587000 | 3024509 |
| 85126025 | (NY/NJ) Consultation with Preeti Rijal, LMSW | 10 min | 20 min after | 12967294 | 3095451 |
| 84838012 | (NY/NJ) Consultation with Vikram Bal, LMSW | 10 min | 20 min after | 12905019 | 3088633 |

### Client Consultations (NY Only)

| ID | Name | Duration | Padding | Calendar ID | Form ID |
|----|------|----------|---------|-------------|---------|
| 82154711 | (NY ONLY) Consultation with Ranya Pohoomull, LMSW | 10 min | 20 min after | 12581620 | 3024505 |
| 64334368 | (NY ONLY) Consultation with Deepa Saharia, LMSW | 10 min | 20 min after | 12904983 | 2682632 |
| 67199108 | (NY ONLY) New Client Consultation with Rebecca Singh, MHC-LP | 10 min | 20 min after | 10603132 | 2726498 |
| 48494032 | (NY ONLY) New Client Consultation with Mehar Ahuja, MHC-LP | 10 min | 20 min after | 8535536 | 2401239 |

### Other Client Consultations

| ID | Name | Duration | Padding | Calendar ID | Form ID |
|----|------|----------|---------|-------------|---------|
| 73945356 | New Client Consultation with Riddhi Cidambi, LCSW | 10 min | 20 min after | 11490431 | 2856050 |
| 55306014 | New Client Consultation with Gajan Gugendiran, LMHC | 10 min | 10 min after | 9280636 | 2526118 |
| 70007049 | New Client Consultation with Apeksha Mehta, MHC-LP | 10 min | 10 min after | 10952079 | 2778861 |
| 48494073 | Consultation with Gaya Kodiyalam, LCSW | 10 min | 20 min after | - | 2526142 |

### Support Groups

| ID | Name | Duration | Calendar IDs | Form ID |
|----|------|----------|--------------|---------|
| 58267720 | South Asian Men's Group | 10 min | 9280636, 11490431 | 2575230 |
| 77148776 | South Asian Women's Support Group | 10 min | - | 2564164 |
| 84241634 | Support Group for Indo-Caribbean Young Professionals | 10 min | - | - |

### Scheduling URLs

Each appointment type has a direct booking URL:
- Pattern: `https://GayaTherapyClinicianConsultation.as.me/{slug}`
- Examples:
  - `/hiring` - Hiring Introduction with Gaya
  - `/Gajan` - Consultation with Gajan
  - `/Mehar` - Consultation with Mehar
  - `/SouthAsianMensGroup` - Men's Support Group

---

## Current Calendars

Calendar IDs referenced in appointment types:

| Calendar ID | Associated Clinicians/Purpose |
|-------------|-------------------------------|
| 8535536 | Mehar Ahuja |
| 9280636 | Gajan Gugendiran |
| 10603132 | Rebecca Singh |
| 10952079 | Apeksha Mehta |
| 11490431 | Riddhi Cidambi |
| 11791930 | Gaya Kodiyalam |
| 12167984 | Shama Goklani |
| 12581620 | Ranya Pohoomull |
| 12587000 | Polly Mehta |
| 12904983 | Deepa Saharia |
| 12905019 | Vikram Bal |
| 12967294 | Preeti Rijal |

---

## Code Examples

### Node.js - Full Client

```javascript
const axios = require('axios');
require('dotenv').config();

class AcuityClient {
  constructor() {
    this.baseUrl = 'https://acuityscheduling.com/api/v1';
    this.auth = {
      username: process.env.ACUITY_USER_ID,
      password: process.env.ACUITY_API_KEY
    };
  }

  async getAppointments(params = {}) {
    const response = await axios.get(`${this.baseUrl}/appointments`, {
      auth: this.auth,
      params
    });
    return response.data;
  }

  async getAppointment(id) {
    const response = await axios.get(`${this.baseUrl}/appointments/${id}`, {
      auth: this.auth
    });
    return response.data;
  }

  async createAppointment(data, options = {}) {
    const params = new URLSearchParams();
    if (options.admin) params.append('admin', 'true');
    if (options.noEmail) params.append('noEmail', 'true');

    const response = await axios.post(
      `${this.baseUrl}/appointments?${params}`,
      data,
      { auth: this.auth }
    );
    return response.data;
  }

  async cancelAppointment(id, options = {}) {
    const params = new URLSearchParams();
    if (options.admin) params.append('admin', 'true');
    if (options.noEmail) params.append('noEmail', 'true');

    const response = await axios.put(
      `${this.baseUrl}/appointments/${id}/cancel?${params}`,
      options.noShow !== undefined ? { noShow: options.noShow } : {},
      { auth: this.auth }
    );
    return response.data;
  }

  async rescheduleAppointment(id, datetime, calendarID = null, options = {}) {
    const params = new URLSearchParams();
    if (options.admin) params.append('admin', 'true');
    if (options.noEmail) params.append('noEmail', 'true');

    const data = { datetime };
    if (calendarID) data.calendarID = calendarID;

    const response = await axios.put(
      `${this.baseUrl}/appointments/${id}/reschedule?${params}`,
      data,
      { auth: this.auth }
    );
    return response.data;
  }

  async getAvailableDates(appointmentTypeID, month, calendarID = null) {
    const params = { appointmentTypeID, month };
    if (calendarID) params.calendarID = calendarID;

    const response = await axios.get(`${this.baseUrl}/availability/dates`, {
      auth: this.auth,
      params
    });
    return response.data;
  }

  async getAvailableTimes(appointmentTypeID, date, calendarID = null) {
    const params = { appointmentTypeID, date };
    if (calendarID) params.calendarID = calendarID;

    const response = await axios.get(`${this.baseUrl}/availability/times`, {
      auth: this.auth,
      params
    });
    return response.data;
  }

  async getAppointmentTypes() {
    const response = await axios.get(`${this.baseUrl}/appointment-types`, {
      auth: this.auth
    });
    return response.data;
  }

  async getCalendars() {
    const response = await axios.get(`${this.baseUrl}/calendars`, {
      auth: this.auth
    });
    return response.data;
  }

  async getWebhooks() {
    const response = await axios.get(`${this.baseUrl}/webhooks`, {
      auth: this.auth
    });
    return response.data;
  }

  async createWebhook(event, target) {
    const response = await axios.post(
      `${this.baseUrl}/webhooks`,
      { event, target },
      { auth: this.auth }
    );
    return response.data;
  }

  async deleteWebhook(id) {
    const response = await axios.delete(`${this.baseUrl}/webhooks/${id}`, {
      auth: this.auth
    });
    return response.data;
  }
}

module.exports = AcuityClient;
```

### Python - Full Client

```python
import requests
import os
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class AcuityClient:
    def __init__(self):
        self.base_url = "https://acuityscheduling.com/api/v1"
        self.auth = (
            os.getenv("ACUITY_USER_ID"),
            os.getenv("ACUITY_API_KEY")
        )

    def get_appointments(self, **params) -> List[Dict]:
        response = requests.get(
            f"{self.base_url}/appointments",
            auth=self.auth,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_appointment(self, appointment_id: int) -> Dict:
        response = requests.get(
            f"{self.base_url}/appointments/{appointment_id}",
            auth=self.auth
        )
        response.raise_for_status()
        return response.json()

    def create_appointment(
        self,
        datetime: str,
        appointment_type_id: int,
        first_name: str,
        last_name: str,
        email: str,
        calendar_id: Optional[int] = None,
        admin: bool = False,
        no_email: bool = False,
        **extra_fields
    ) -> Dict:
        params = {}
        if admin:
            params["admin"] = "true"
        if no_email:
            params["noEmail"] = "true"

        data = {
            "datetime": datetime,
            "appointmentTypeID": appointment_type_id,
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            **extra_fields
        }
        if calendar_id:
            data["calendarID"] = calendar_id

        response = requests.post(
            f"{self.base_url}/appointments",
            auth=self.auth,
            params=params,
            json=data
        )
        response.raise_for_status()
        return response.json()

    def cancel_appointment(
        self,
        appointment_id: int,
        admin: bool = False,
        no_email: bool = False,
        no_show: Optional[bool] = None
    ) -> Dict:
        params = {}
        if admin:
            params["admin"] = "true"
        if no_email:
            params["noEmail"] = "true"

        data = {}
        if no_show is not None:
            data["noShow"] = no_show

        response = requests.put(
            f"{self.base_url}/appointments/{appointment_id}/cancel",
            auth=self.auth,
            params=params,
            json=data if data else None
        )
        response.raise_for_status()
        return response.json()

    def reschedule_appointment(
        self,
        appointment_id: int,
        datetime: str,
        calendar_id: Optional[int] = None,
        admin: bool = False,
        no_email: bool = False
    ) -> Dict:
        params = {}
        if admin:
            params["admin"] = "true"
        if no_email:
            params["noEmail"] = "true"

        data = {"datetime": datetime}
        if calendar_id:
            data["calendarID"] = calendar_id

        response = requests.put(
            f"{self.base_url}/appointments/{appointment_id}/reschedule",
            auth=self.auth,
            params=params,
            json=data
        )
        response.raise_for_status()
        return response.json()

    def get_available_dates(
        self,
        appointment_type_id: int,
        month: str,
        calendar_id: Optional[int] = None
    ) -> List[Dict]:
        params = {
            "appointmentTypeID": appointment_type_id,
            "month": month
        }
        if calendar_id:
            params["calendarID"] = calendar_id

        response = requests.get(
            f"{self.base_url}/availability/dates",
            auth=self.auth,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_available_times(
        self,
        appointment_type_id: int,
        date: str,
        calendar_id: Optional[int] = None
    ) -> List[Dict]:
        params = {
            "appointmentTypeID": appointment_type_id,
            "date": date
        }
        if calendar_id:
            params["calendarID"] = calendar_id

        response = requests.get(
            f"{self.base_url}/availability/times",
            auth=self.auth,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_appointment_types(self) -> List[Dict]:
        response = requests.get(
            f"{self.base_url}/appointment-types",
            auth=self.auth
        )
        response.raise_for_status()
        return response.json()

    def get_calendars(self) -> List[Dict]:
        response = requests.get(
            f"{self.base_url}/calendars",
            auth=self.auth
        )
        response.raise_for_status()
        return response.json()


# Usage example
if __name__ == "__main__":
    client = AcuityClient()

    # Get all appointment types
    types = client.get_appointment_types()
    for t in types:
        print(f"{t['id']}: {t['name']} ({t['duration']} min)")
```

### cURL Examples

```bash
# List all appointments
curl -s -X GET "https://acuityscheduling.com/api/v1/appointments" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"

# Get appointment types
curl -s -X GET "https://acuityscheduling.com/api/v1/appointment-types" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"

# Check availability for December 2024
curl -s -X GET "https://acuityscheduling.com/api/v1/availability/dates?appointmentTypeID=79891463&month=2024-12" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"

# Get available times for a specific date
curl -s -X GET "https://acuityscheduling.com/api/v1/availability/times?appointmentTypeID=79891463&date=2024-12-20" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"

# Create an appointment (admin mode)
curl -X POST "https://acuityscheduling.com/api/v1/appointments?admin=true&noEmail=true" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7" \
  -H "Content-Type: application/json" \
  -d '{
    "datetime": "2024-12-20T10:00:00-0500",
    "appointmentTypeID": 79891463,
    "calendarID": 11791930,
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com"
  }'

# Cancel an appointment
curl -X PUT "https://acuityscheduling.com/api/v1/appointments/123456/cancel?admin=true" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"

# List webhooks
curl -s -X GET "https://acuityscheduling.com/api/v1/webhooks" \
  -u "29399858:7bf7b50fe31c72130fa17f077e4920d7"
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - validation error |
| 401 | Unauthorized - invalid credentials |
| 404 | Not Found - resource doesn't exist |
| 422 | Unprocessable Entity - unparseable data |
| 500 | Server Error |

### Common Error Codes (400 responses)

| Error Code | Description |
|------------|-------------|
| `required_first_name` | First name is required |
| `required_last_name` | Last name is required |
| `invalid_email` | Email format is invalid |
| `not_available` | Time slot is not available |
| `invalid_certificate` | Coupon/package code is invalid |
| `expired_certificate` | Coupon/package has expired |
| `cancel_not_allowed` | Client cancellation disabled |
| `cancel_too_close` | Too close to appointment time |
| `reschedule_not_allowed` | Client rescheduling disabled |
| `reschedule_too_close` | Too close to appointment time |
| `reschedule_series` | Cannot reschedule class series |
| `reschedule_canceled` | Cannot reschedule canceled appointment |
| `required_datetime` | Datetime is required |

### Error Response Format

```json
{
  "status_code": 400,
  "message": "Human readable error message",
  "error": "error_code"
}
```

### Handling Errors in Code

```javascript
try {
  const appointment = await acuity.createAppointment(data);
} catch (error) {
  if (error.response) {
    const { status_code, message, error: errorCode } = error.response.data;

    switch (errorCode) {
      case 'not_available':
        console.log('Time slot not available, please choose another');
        break;
      case 'invalid_email':
        console.log('Please provide a valid email address');
        break;
      default:
        console.log(`Error: ${message}`);
    }
  }
}
```

---

## Best Practices

### 1. Rate Limiting

Acuity doesn't publish specific rate limits, but follow these guidelines:
- Avoid rapid-fire requests
- Implement exponential backoff on failures
- Cache data that doesn't change frequently (appointment types, calendars)

### 2. Date/Time Handling

- Always use ISO 8601 format: `2024-12-20T10:00:00-0500`
- Include timezone offset or use IANA timezone parameter
- Times must be parseable by PHP's `strtotime()` function

### 3. Webhook Best Practices

- Always verify signatures before processing
- Respond quickly (< 5 seconds) to avoid timeouts
- Process webhook data asynchronously if needed
- Implement idempotency (webhooks may be delivered multiple times)
- Use `appointment.changed` as a catch-all for any modifications

### 4. Admin Mode

Use `admin=true` when:
- Creating appointments from your backend (not client-facing)
- Bypassing availability checks for special cases
- Setting notes or other admin-only fields
- Canceling/rescheduling outside normal rules

### 5. Suppress Notifications

Use `noEmail=true` when:
- Testing/development
- You're sending your own custom notifications
- Bulk operations where individual emails aren't needed

### 6. Form Fields

When submitting custom form data:
```json
{
  "fields": [
    {"id": 123, "value": "Answer 1"},
    {"id": 456, "value": "Option A, Option B"}
  ]
}
```

Note: Checkbox values should be comma-delimited with spaces after commas.

---

## Quick Reference Card

```
Base URL: https://acuityscheduling.com/api/v1
Auth: Basic Auth (UserID:APIKey)

APPOINTMENTS
  GET    /appointments              List all
  GET    /appointments/{id}         Get one
  POST   /appointments              Create
  PUT    /appointments/{id}         Update
  PUT    /appointments/{id}/cancel  Cancel
  PUT    /appointments/{id}/reschedule  Reschedule

AVAILABILITY
  GET    /availability/dates        Available dates
  GET    /availability/times        Available times
  GET    /availability/classes      Available classes

RESOURCES
  GET    /appointment-types         List types
  GET    /calendars                 List calendars
  GET    /products                  List products
  GET    /certificates              List certificates

WEBHOOKS
  GET    /webhooks                  List webhooks
  POST   /webhooks                  Create webhook
  DELETE /webhooks/{id}             Delete webhook

COMMON PARAMS
  ?admin=true                       Bypass validations
  ?noEmail=true                     Suppress notifications
  ?canceled=true                    Show canceled only
  ?showall=true                     Show all including canceled
```

---

## Support & Resources

- **Official API Docs:** https://developers.acuityscheduling.com/reference/quick-start
- **Webhook Docs:** https://developers.acuityscheduling.com/docs/webhooks
- **OAuth2 Setup:** https://developers.acuityscheduling.com/reference/oauth2
- **Enterprise API:** https://enterprise-scheduling.readme.io

---

*This documentation was generated for Gaya Therapy practice integration. Credentials and appointment types are specific to this account.*
