# System design

## Architecture

```mermaid
flowchart LR
  Browser[React UI] -->|HTTPS JSON + Bearer JWT| API[Spring Boot REST API]
  API --> Sec[JWT filter / Spring Security]
  API --> C[Controllers + DTO validation]
  C --> S[Transactional services]
  S --> R[JPA repositories]
  R --> DB[(PostgreSQL)]
  Flyway[Flyway migrations] --> DB
```

## ER diagram

```mermaid
erDiagram
  USERS ||--o| PATIENTS : has
  USERS ||--o| DOCTORS : has
  SPECIALIZATIONS ||--o{ DOCTORS : classifies
  DOCTORS ||--o{ DOCTOR_AVAILABILITY : publishes
  DOCTORS ||--o{ APPOINTMENTS : receives
  PATIENTS ||--o{ APPOINTMENTS : books
  APPOINTMENTS ||--o| MEDICAL_RECORDS : documents
  MEDICAL_RECORDS ||--o{ PRESCRIPTIONS : issues
  PRESCRIPTIONS ||--o{ PRESCRIPTION_ITEMS : contains
  MEDICATIONS ||--o{ PRESCRIPTION_ITEMS : references
  USERS { bigint id PK string email UK string role }
  PATIENTS { bigint id PK bigint user_id FK }
  DOCTORS { bigint id PK bigint user_id FK bigint specialization_id FK }
  DOCTOR_AVAILABILITY { bigint id PK bigint doctor_id FK datetime starts_at }
  APPOINTMENTS { bigint id PK bigint patient_id FK bigint doctor_id FK datetime starts_at string status }
  MEDICAL_RECORDS { bigint id PK bigint appointment_id FK }
  PRESCRIPTIONS { bigint id PK bigint medical_record_id FK }
  MEDICATIONS { bigint id PK string name UK }
  PRESCRIPTION_ITEMS { bigint id PK bigint prescription_id FK bigint medication_id FK }
```

The schema is normalized around account identity, patient/doctor profile, specialization, published slots and appointment facts. A unique `(doctor_id, starts_at)` constraint on availability and a partial unique index on active appointments prevent duplicate slots/bookings while allowing cancelled slots to be reused. Indexes support doctor slot lookup and patient/doctor appointment history.

## Booking sequence

```mermaid
sequenceDiagram
  actor Patient
  participant UI as React UI
  participant API as Appointment API
  participant Service as AppointmentService
  participant DB as PostgreSQL
  Patient->>UI: Choose doctor and published slot
  UI->>API: POST /api/appointments + JWT
  API->>Service: Validate patient identity and request
  Service->>DB: Verify active doctor and exact future availability
  Service->>DB: Check existing active appointment
  Service->>DB: Insert appointment (unique doctor/start)
  DB-->>Service: Persisted appointment
  Service-->>UI: Appointment response DTO
```

## Core class relationships

```mermaid
classDiagram
  class AuthController
  class DoctorController
  class AppointmentController
  class AuthService
  class DoctorService
  class AppointmentService
  class UserRepository
  class DoctorRepository
  class AppointmentRepository
  AuthController --> AuthService
  DoctorController --> DoctorService
  AppointmentController --> AppointmentService
  AuthService --> UserRepository
  DoctorService --> DoctorRepository
  AppointmentService --> AppointmentRepository
```

## API conventions

JSON DTOs are the contract. Authentication uses `Authorization: Bearer <token>`. The UI stores the token in session storage and attaches it to API requests. The API returns standard HTTP statuses (400 validation, 401 authentication, 403 ownership/role, 404 missing data, 409 business conflict). Swagger documents endpoint contracts.
