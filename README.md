# Hospital Appointment & Patient Management System

A software engineering project starter for hospital appointments and patient records. The current implementation includes account registration/login, role-aware doctor discovery, published availability, appointment booking/listing/cancellation, and patient access to their own recorded medical and medication history.

## Stack and layout

- `backend/`: Java 17+, Spring Boot REST API, Spring Security, JWT, JPA, PostgreSQL, Flyway, OpenAPI.
- `frontend/`: React + Vite responsive single-page application.
- `docs/`: requirements summary and architecture/design diagrams.

## Run locally

### Try the interactive prototype

Open [frontend/prototype/index.html](frontend/prototype/index.html) in a browser. It runs without installing packages or starting the API. Demo accounts and workflows are listed in [the prototype guide](frontend/prototype/README.md). This version stores fictional demo data in browser local storage; it is separate from the Spring Boot API and is not suitable for real patient information.

### Run the React + Spring application

Prerequisites: JDK 17+, Node.js 20+, PostgreSQL 15+. The Windows wrapper downloads Maven 3.10.0 on first use, so Maven does not need to be installed globally.

1. Create a PostgreSQL database and user, or use Docker Compose:

   ```sh
   docker compose up -d db
   ```

2. Start the API from `backend/` (in Windows PowerShell):

   ```sh
   .\mvnw.cmd spring-boot:run
   ```

   Defaults target `localhost:5432/hospital`; override with `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and set a strong `JWT_SECRET` (at least 32 bytes) outside local development. The local compose password is for development only.

3. Start the UI from `frontend/`:

   ```sh
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. The UI calls `http://localhost:8080/api` by default. Swagger UI is at `http://localhost:8080/swagger-ui.html`.

## API overview

- `POST /api/auth/register` and `/api/auth/login`
- `GET /api/doctors` and `/api/doctors/{id}/availability`
- `POST /api/appointments` (authenticated patient; doctor + published future slot required)
- `GET /api/appointments/me` (patient's or doctor's own appointments)
- `PATCH /api/appointments/{id}/cancel` (owner, at least 24 hours before start)
- `GET /api/patient/medical-records` (authenticated patient's own medical history and prescriptions)
- `GET /api/doctor/patients/{patientId}/medical-records` (doctor assigned to that patient)
- `PUT /api/doctor/appointments/{appointmentId}/medical-record` (doctor's own past appointment)
- `POST /api/doctor/medical-records/{recordId}/prescriptions` (doctor who owns the appointment)

All request/response payloads use DTOs. IDs and ownership are checked in services. Booking is transactional and backed by a unique `(doctor_id, starts_at)` constraint. JWT authentication is stateless; passwords use BCrypt. The application deliberately has no public admin registration or secret patient record endpoint.

## Scope and limitations

Implemented: account creation/login, BCrypt passwords, signed expiring JWTs, role-based API access, doctor search by name/specialization, published availability, appointment booking/list/cancellation, duplicate-slot protection, patient access to their own appointment and medical/medication histories, doctor access to their patients' medical histories, recording diagnoses/notes and adding prescriptions for their own appointments, Flyway schema and seed data, OpenAPI, and responsive patient and doctor workspaces.

Planned in the Spring API: administrator account/profile management, doctor self-service availability editing, rescheduling and the remaining appointment lifecycle, audit log, and pagination on all list APIs. Doctors can review history for patients with appointments assigned to them; record and prescription writes are restricted to their own appointments. Patient history is scoped to the signed-in patient and is read-only. The optional ward/bed module is not included.

### Development seed accounts

Flyway seeds five doctors and five patients, each with a fictional sample account. The two original doctor profiles are retained. All listed accounts share the development-only password `DemoPass123!`.

| Role | Email |
| --- | --- |
| Doctor | `avery.shah@example.test` |
| Doctor | `jordan.lee@example.test` |
| Doctor | `morgan.chen@example.test` |
| Doctor | `riley.patel@example.test` |
| Doctor | `casey.rivera@example.test` |
| Patient | `taylor.brooks@example.test` |
| Patient | `jamie.park@example.test` |
| Patient | `alex.morgan@example.test` |
| Patient | `samira.khan@example.test` |
| Patient | `drew.wilson@example.test` |

Use the current generic `/api/auth/login` endpoint for these backend accounts and select the matching role on the sign-in form. The role is still determined by the account on the server; registration creates patient accounts only. Do not reuse this password or seed data outside local development.

Seeded patient medical histories are attached to completed past appointments. Each seeded patient has three fictional demo prescriptions visible in their patient Medication history and the doctor workspace. These diagnoses, notes, medication names, and prescription details are development fixtures only, not medical guidance and not for real patient care.

## Verification

Run backend tests with `mvn test` in `backend/`; run the UI production build with `npm run build` in `frontend/`. The included unit test verifies that past-slot booking is rejected before repository access. Additional race-condition and authorization integration tests are still needed. These commands require dependencies to be installed/downloadable.

## Project documents

See [docs/requirements.md](docs/requirements.md) and [docs/design.md](docs/design.md) for scope, use cases, ER, architecture, sequence, and class diagrams.
