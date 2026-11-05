# User guide

## Patient

1. Start the database, API and web UI using the commands in the README.
2. Choose **Create an account** and register with your name, email, and a password of at least 10 characters. New public registrations are patient accounts.
3. Search doctors by name or specialty. Choose **View availability** on a profile.
4. Select a future published time to book. The appointment appears in **Appointment history** after booking.
5. View all your visits in **Appointment history** and cancel an eligible upcoming visit at least 24 hours before the scheduled time.
6. Review diagnoses, clinical notes, prescriptions, and medication details in **Medication history**. Only records connected to your own patient account are returned.

## Doctor and administrator

The browser prototype includes a working local doctor demo account; select **Doctor** on its sign-in page (`avery@carepoint.demo` / `doctor123`). The API has no public doctor/admin registration; do not use patient registration to attempt doctor or admin access.

For local Spring API development, Flyway seeds five doctor accounts and five patient accounts. The accounts use the fictional `example.test` addresses shown in the README and share the development-only password `DemoPass123!`. The sign-in form asks you to choose Patient or Doctor, then verifies that choice against the role returned by the API. Authentication still uses the generic `/api/auth/login` route. Each seeded patient has a completed past appointment with a fictional medical-history row and three fictional demo prescriptions. These records are for development demonstrations only, not medical advice or real patient care.

### Doctor workspace

1. Sign in with a seeded doctor account. The application opens the doctor workspace.
2. Select a patient from **My patients** to view their medical history. Only patients with appointments assigned to the signed-in doctor are listed. The history includes recorded diagnoses, notes, and prescriptions.
3. Use **Document a past appointment** to add a diagnosis and optional clinical notes to an undocumented past appointment assigned to you.
4. Use **Add prescription** on a medical record for one of your appointments. Enter a medication name, dosage, frequency, and optionally duration and instructions.

Doctors can view the medical history of their assigned patients, while writing records and prescriptions is restricted to their own appointments. These seeded records and accounts are fictional development data and must not be used for real patient care.

## Troubleshooting

- If the doctor list is empty, confirm the API started successfully and Flyway migrations ran.
- If booking returns a conflict, the selected time may no longer be available; refresh its availability.
- If a token expires, sign out and sign in again.
- Keep `JWT_SECRET` and the database password private outside local development.
