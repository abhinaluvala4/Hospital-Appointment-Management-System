INSERT INTO users(full_name,email,password_hash,role) VALUES
 ('Avery Shah','avery.shah@example.test','$2a$10$abcdefghijklmnopqrstuuN6xvNQxWg3dNKnBOrl6R0h1W2.1R5Qy','DOCTOR'),
 ('Jordan Lee','jordan.lee@example.test','$2a$10$abcdefghijklmnopqrstuuN6xvNQxWg3dNKnBOrl6R0h1W2.1R5Qy','DOCTOR');
INSERT INTO doctors(user_id,specialization_id,bio)
 SELECT u.id,s.id,'Sample profile for development.' FROM users u JOIN specializations s ON s.name='Cardiology' WHERE u.email='avery.shah@example.test';
INSERT INTO doctors(user_id,specialization_id,bio)
 SELECT u.id,s.id,'Sample profile for development.' FROM users u JOIN specializations s ON s.name='Family Medicine' WHERE u.email='jordan.lee@example.test';
INSERT INTO doctor_availability(doctor_id,starts_at,ends_at)
 SELECT d.id, (date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') + n * interval '1 day' + interval '10 hours',
        (date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') + n * interval '1 day' + interval '10 hours 30 minutes'
 FROM doctors d CROSS JOIN generate_series(1,14) AS n;
