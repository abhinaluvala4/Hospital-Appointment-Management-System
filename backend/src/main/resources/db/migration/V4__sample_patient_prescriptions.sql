INSERT INTO medications(name, description)
VALUES
    ('Demo medication A', 'Fictional development-only medication entry.'),
    ('Demo medication B', 'Fictional development-only medication entry.'),
    ('Demo medication C', 'Fictional development-only medication entry.')
ON CONFLICT (name) DO NOTHING;

WITH sample_prescriptions(patient_email, prescription_number, medication_name, issued_offset) AS (
    VALUES
        ('taylor.brooks@example.test', 1, 'Demo medication A', 1),
        ('taylor.brooks@example.test', 2, 'Demo medication B', 2),
        ('taylor.brooks@example.test', 3, 'Demo medication C', 3),
        ('jamie.park@example.test', 1, 'Demo medication A', 1),
        ('jamie.park@example.test', 2, 'Demo medication B', 2),
        ('jamie.park@example.test', 3, 'Demo medication C', 3),
        ('alex.morgan@example.test', 1, 'Demo medication A', 1),
        ('alex.morgan@example.test', 2, 'Demo medication B', 2),
        ('alex.morgan@example.test', 3, 'Demo medication C', 3),
        ('samira.khan@example.test', 1, 'Demo medication A', 1),
        ('samira.khan@example.test', 2, 'Demo medication B', 2),
        ('samira.khan@example.test', 3, 'Demo medication C', 3),
        ('drew.wilson@example.test', 1, 'Demo medication A', 1),
        ('drew.wilson@example.test', 2, 'Demo medication B', 2),
        ('drew.wilson@example.test', 3, 'Demo medication C', 3)
),
seeded_records AS (
    SELECT patient_user.email AS patient_email,
           record.id AS record_id,
           appointment.starts_at
    FROM medical_records record
    JOIN appointments appointment ON appointment.id = record.appointment_id
    JOIN patients patient ON patient.id = appointment.patient_id
    JOIN users patient_user ON patient_user.id = patient.user_id
    WHERE patient_user.email IN (
        'taylor.brooks@example.test',
        'jamie.park@example.test',
        'alex.morgan@example.test',
        'samira.khan@example.test',
        'drew.wilson@example.test'
    )
)
INSERT INTO prescriptions(medical_record_id, issued_at, instructions)
SELECT seeded.record_id,
       seeded.starts_at + sample.issued_offset * interval '1 hour',
       format('Fictional demo prescription %s. Not for real patient care.', sample.prescription_number)
FROM sample_prescriptions sample
JOIN seeded_records seeded ON seeded.patient_email = sample.patient_email
WHERE NOT EXISTS (
    SELECT 1
    FROM prescriptions existing
    WHERE existing.medical_record_id = seeded.record_id
      AND existing.instructions = format('Fictional demo prescription %s. Not for real patient care.', sample.prescription_number)
);

WITH sample_prescriptions(patient_email, prescription_number, medication_name) AS (
    VALUES
        ('taylor.brooks@example.test', 1, 'Demo medication A'),
        ('taylor.brooks@example.test', 2, 'Demo medication B'),
        ('taylor.brooks@example.test', 3, 'Demo medication C'),
        ('jamie.park@example.test', 1, 'Demo medication A'),
        ('jamie.park@example.test', 2, 'Demo medication B'),
        ('jamie.park@example.test', 3, 'Demo medication C'),
        ('alex.morgan@example.test', 1, 'Demo medication A'),
        ('alex.morgan@example.test', 2, 'Demo medication B'),
        ('alex.morgan@example.test', 3, 'Demo medication C'),
        ('samira.khan@example.test', 1, 'Demo medication A'),
        ('samira.khan@example.test', 2, 'Demo medication B'),
        ('samira.khan@example.test', 3, 'Demo medication C'),
        ('drew.wilson@example.test', 1, 'Demo medication A'),
        ('drew.wilson@example.test', 2, 'Demo medication B'),
        ('drew.wilson@example.test', 3, 'Demo medication C')
)
INSERT INTO prescription_items(prescription_id, medication_id, dosage, frequency, duration_days)
SELECT prescription.id,
       medication.id,
       'Demo dosage',
       'As recorded in fictional sample data',
       7
FROM sample_prescriptions sample
JOIN users patient_user ON patient_user.email = sample.patient_email
JOIN patients patient ON patient.user_id = patient_user.id
JOIN appointments appointment ON appointment.patient_id = patient.id
JOIN medical_records record ON record.appointment_id = appointment.id
JOIN prescriptions prescription
  ON prescription.medical_record_id = record.id
 AND prescription.instructions = format('Fictional demo prescription %s. Not for real patient care.', sample.prescription_number)
JOIN medications medication ON medication.name = sample.medication_name
WHERE NOT EXISTS (
    SELECT 1
    FROM prescription_items existing
    WHERE existing.prescription_id = prescription.id
);
