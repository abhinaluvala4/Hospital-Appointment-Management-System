
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE specializations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    phone VARCHAR(30),
    date_of_birth DATE
);

CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    specialization_id BIGINT NOT NULL REFERENCES specializations(id),
    bio VARCHAR(1000),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE doctor_availability (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    CHECK (ends_at > starts_at)
);

CREATE INDEX idx_availability_doctor_start
    ON doctor_availability(doctor_id, starts_at);

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
        CHECK (
            status IN (
                'PENDING',
                'CONFIRMED',
                'COMPLETED',
                'CANCELLED',
                'RESCHEDULED'
            )
        ),
    reason VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ends_at > starts_at)
);

CREATE UNIQUE INDEX uq_active_appointment_slot
    ON appointments(doctor_id, starts_at)
    WHERE status IN ('PENDING', 'CONFIRMED');

CREATE INDEX idx_appointments_patient_start
    ON appointments(patient_id, starts_at DESC);

CREATE INDEX idx_appointments_doctor_start
    ON appointments(doctor_id, starts_at);

CREATE TABLE medical_records (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE REFERENCES appointments(id),
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    medical_record_id BIGINT NOT NULL REFERENCES medical_records(id),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    instructions TEXT
);

CREATE TABLE medications (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL UNIQUE,
    description VARCHAR(500)
);

CREATE TABLE prescription_items (
    id BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL
        REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_id BIGINT NOT NULL REFERENCES medications(id),
    dosage VARCHAR(120) NOT NULL,
    frequency VARCHAR(120) NOT NULL,
    duration_days INTEGER
        CHECK (duration_days IS NULL OR duration_days > 0)
);

INSERT INTO specializations(name)
VALUES ('Cardiology'), ('Dermatology'), ('Family Medicine');

