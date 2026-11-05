# Requirements summary

## Goal

Centralize patient registration, doctor discovery, published appointment slots, and appointment ownership in a secure web application. The initial increment prioritizes a complete, reviewable appointment journey.

## Actors and use cases

| Actor | Use case | Current state |
| --- | --- | --- |
| Patient | Register/login | Implemented |
| Patient | Search doctors and view availability | Implemented |
| Patient | Book an available future slot | Implemented |
| Patient | View own appointments and cancel at least 24 hours ahead | Implemented |
| Doctor | Login and view own appointments | Appointment API supports doctor role; browser demo login works; backend has no usable seeded doctor password |
| Administrator | Manage users, doctor profiles and all appointments | Planned |
| Doctor | Publish availability, add diagnoses and prescriptions | Planned |
| Patient | View medical records and prescriptions | Planned |

## Business rules in this increment

- Only patient accounts are self-registered. API authorization uses roles.
- Booking requires an exact published slot whose start is in the future.
- An active appointment slot is unique per doctor in PostgreSQL. The service checks first for a friendly conflict response; a partial unique index closes races and allows a cancelled slot to be booked later.
- Cancellation is limited to active appointments at least 24 hours before their start.
- The current booking action creates a `CONFIRMED` appointment. `PENDING`, completion, and rescheduling states exist in the schema/domain but corresponding workflows remain planned.
- Patients can list and cancel only their own appointments. Doctors can list and cancel only their own assigned appointments. Admin list access exists in the service but admin provisioning and management UI are planned.

## Security and quality constraints

JWTs expire after 60 minutes by default. Passwords are BCrypt hashed. Database access uses parameterized JPA queries. Input DTOs are validated and response DTOs prevent entity serialization. CORS allows the configured frontend origin. Errors use a consistent envelope and omit exception details.

## Acceptance checks

1. Registering creates a patient and returns a signed token.
2. Invalid credentials return 401 without distinguishing unknown email from wrong password.
3. Anonymous users can browse doctors and availability; booking requires a patient JWT.
4. Booking a past or unpublished slot is rejected.
5. Two bookings for one doctor/start cannot both persist, including concurrent attempts.
6. Appointment listings and cancellations enforce ownership.
7. Cancellation inside 24 hours and invalid state changes are rejected.
