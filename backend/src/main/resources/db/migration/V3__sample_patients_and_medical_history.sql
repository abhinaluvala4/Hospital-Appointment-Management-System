INSERT INTO users(full_name, email, password_hash, role) VALUES
    ('Morgan Chen', 'morgan.chen@example.test', '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu', 'DOCTOR'),
    ('Riley Patel', 'riley.patel@example.test', '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu', 'DOCTOR'),
    ('Casey Rivera', 'casey.rivera@example.test', '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu', 'DOCTOR'),
    ('Taylor Brooks', 'taylor.brooks@example.test', '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu', 'PATIENT'),
    ('Jamie Park', 'jamie.park@example.test', '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu', 'PATIENT'),
    ('Alex Morgan', 'alex.morgan@example.test', '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu', 'PATIENT'),
    ('Samira Khan', 'samira.khan@example.test', '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu', 'PATIENT'),
    ('Drew Wilson', 'drew.wilson@example.test', '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu', 'PATIENT');

UPDATE users
SET password_hash = '$2a$10$paP1RFjCB2oj46mWdMA5VO962qI2ptp7McZDZnWXLKe394JzpHHcu'
WHERE email IN ('avery.shah@example.test', 'jordan.lee@example.test');

INSERT INTO doctors(user_id, specialization_id, bio)
SELECT u.id, s.id, sample.bio
FROM (VALUES
    ('morgan.chen@example.test', 'Cardiology', 'Sample cardiology profile for development.'),
    ('riley.patel@example.test', 'Dermatology', 'Sample dermatology profile for development.'),
    ('casey.rivera@example.test', 'Family Medicine', 'Sample family medicine profile for development.')
) AS sample(email, specialization, bio)
JOIN users u ON u.email = sample.email
JOIN specializations s ON s.name = sample.specialization;

INSERT INTO patients(user_id, date_of_birth)
SELECT u.id, sample.date_of_birth::date
FROM (VALUES
    ('taylor.brooks@example.test', '1988-04-12'),
    ('jamie.park@example.test', '1993-09-25'),
    ('alex.morgan@example.test', '1979-02-08'),
    ('samira.khan@example.test', '2000-06-17'),
    ('drew.wilson@example.test', '1967-11-03')
) AS sample(email, date_of_birth)
JOIN users u ON u.email = sample.email;

INSERT INTO doctor_availability(doctor_id, starts_at, ends_at)
SELECT d.id,
       (date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
           + n * interval '1 day' + interval '10 hours',
       (date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
           + n * interval '1 day' + interval '10 hours 30 minutes'
FROM doctors d
JOIN users u ON u.id = d.user_id
CROSS JOIN generate_series(1, 14) AS n
WHERE u.email IN (
    'morgan.chen@example.test',
    'riley.patel@example.test',
    'casey.rivera@example.test'
);

WITH sample_history(patient_email, doctor_email, days_ago, reason, diagnosis, notes) AS (
    VALUES
        ('taylor.brooks@example.test', 'avery.shah@example.test', 180,
         'Routine follow-up', 'Seasonal allergic rhinitis',
         'Fictional sample history. Symptoms improved with the care plan.'),
        ('jamie.park@example.test', 'jordan.lee@example.test', 150,
         'Skin irritation', 'Mild contact dermatitis',
         'Fictional sample history. Irritant avoidance was discussed.'),
        ('alex.morgan@example.test', 'morgan.chen@example.test', 120,
         'Blood pressure follow-up', 'Essential hypertension',
         'Fictional sample history. Home blood pressure monitoring advised.'),
        ('samira.khan@example.test', 'riley.patel@example.test', 90,
         'Persistent rash', 'Atopic dermatitis',
         'Fictional sample history. Skin care and follow-up guidance provided.'),
        ('drew.wilson@example.test', 'casey.rivera@example.test', 60,
         'Annual wellness visit', 'Type 2 diabetes mellitus',
         'Fictional sample history. Nutrition counseling and routine monitoring discussed.')
),
created_appointments AS (
    INSERT INTO appointments(patient_id, doctor_id, starts_at, ends_at, status, reason)
    SELECT p.id,
           d.id,
           now() - sample.days_ago * interval '1 day',
           now() - sample.days_ago * interval '1 day' + interval '30 minutes',
           'COMPLETED',
           sample.reason
    FROM sample_history sample
    JOIN users patient_user ON patient_user.email = sample.patient_email
    JOIN patients p ON p.user_id = patient_user.id
    JOIN users doctor_user ON doctor_user.email = sample.doctor_email
    JOIN doctors d ON d.user_id = doctor_user.id
    RETURNING id, patient_id, doctor_id
)
INSERT INTO medical_records(appointment_id, diagnosis, notes)
SELECT appointment.id, sample.diagnosis, sample.notes
FROM created_appointments appointment
JOIN patients p ON p.id = appointment.patient_id
JOIN users patient_user ON patient_user.id = p.user_id
JOIN doctors d ON d.id = appointment.doctor_id
JOIN users doctor_user ON doctor_user.id = d.user_id
JOIN sample_history sample
  ON sample.patient_email = patient_user.email
 AND sample.doctor_email = doctor_user.email;
