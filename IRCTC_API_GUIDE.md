# Complete Guide: IRCTC & CRIS API Integration for Real-Time Telemetry

This document outlines the architecture, authentication, and provisioning processes required to access real-time Indian Railways data, ranging from official enterprise B2B pipelines to developer-friendly aggregators.

---

## 1. Official CRIS / IRCTC B2B API (Production)

The Centre for Railway Information Systems (CRIS) operates the National Train Enquiry System (NTES) and the core backend for IRCTC. 

**Important:** There is **no public, self-serve developer portal** for official IRCTC data. Access is strictly gated for enterprise B2B partners (e.g., MakeMyTrip, Ixigo, ConfirmTkt, or logistics corporations).

### How to Request Production Access
1. **Business Proposal:** Submit a formal business application to the commercial department of CRIS or IRCTC detailing your use case (ticketing OTA, logistics tracking, or passenger analytics).
2. **Commercial Agreement:** If approved, you must sign a commercial Service Level Agreement (SLA). This involves substantial licensing fees and security deposits (often ranging from lakhs to crores of rupees annually depending on transaction volume).
3. **Technical Onboarding:** CRIS will assign a technical point of contact (POC) and provide API documentation, staging credentials, and integration guidelines.
4. **Infrastructure Security:** CRIS mandates strict security protocols. You will typically need to configure:
   - Static IP whitelisting.
   - A dedicated VPN or leased line connection directly to CRIS servers.
   - Mutual TLS (mTLS) certificates for encrypted transit.

### Standard CRIS Authentication Headers
While exact schemas vary based on the specific contract (Ticketing vs. Telemetry), a standard REST payload to a CRIS gateway typically requires a combination of static keys and dynamic tokens:

```http
Authorization: Bearer <Dynamic_JWT_Token_or_Oauth>
X-API-KEY: <Provided_CRIS_Client_Key>
X-Client-ID: <Your_Registered_B2B_ID>
Content-Type: application/json
```

---

## 2. Aggregator APIs (Hackathons, Startups & Prototyping)

For developers, startups, and hackathons without a multimillion-rupee CRIS commercial agreement, third-party aggregators (available on marketplaces like RapidAPI) are the industry standard. These platforms manage the underlying complexity of data acquisition and expose clean, RESTful JSON APIs.

### Popular Aggregator: `irctc1` (via RapidAPI)
**Base URL:** `https://irctc1.p.rapidapi.com`

**Required Authentication Headers:**
```http
x-rapidapi-host: irctc1.p.rapidapi.com
x-rapidapi-key: <YOUR_RAPIDAPI_SUBSCRIBER_KEY>
Content-Type: application/json
```

### Key Endpoints

#### A. Live Train Schedule
Retrieves the complete route, scheduled arrival/departure times, distance, and day of journey.
* **Endpoint:** `GET /api/v1/getTrainScheduleV2?trainNo={5_DIGIT_TRAIN_NO}`
* **Example:**
  ```bash
  curl --request GET \
    --url 'https://irctc1.p.rapidapi.com/api/v1/getTrainScheduleV2?trainNo=12936' \
    --header 'x-rapidapi-host: irctc1.p.rapidapi.com' \
    --header 'x-rapidapi-key: YOUR_KEY' \
    --header 'Content-Type: application/json'
  ```

#### B. Search Train Directory
Search the massive IRCTC directory by train number or train name.
* **Endpoint:** `GET /api/v1/searchTrain?query={SEARCH_STRING}`
* **Example:**
  ```bash
  curl --request GET \
    --url 'https://irctc1.p.rapidapi.com/api/v1/searchTrain?query=Rajdhani' \
    --header 'x-rapidapi-host: irctc1.p.rapidapi.com' \
    --header 'x-rapidapi-key: YOUR_KEY' \
    --header 'Content-Type: application/json'
  ```

#### C. Live PNR Status
Check passenger booking status, current charting status, and seat confirmation.
* **Endpoint:** `GET /api/v1/checkPNR?pnrNumber={10_DIGIT_PNR}`

---

## 3. Web Scraping (High Risk - Not Recommended)
Directly scraping `enquiry.indianrail.gov.in` (NTES) is actively blocked by railway IT infrastructure. NTES employs dynamic rate limiting, aggressive IP bans, and CAPTCHA enforcement. 

Building a robust application on top of scraped NTES data is highly unstable and will likely result in your servers being blacklisted. Always prefer official B2B integrations for production or reliable aggregators for prototyping.
