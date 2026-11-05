package com.hospital.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @Column(nullable = false, columnDefinition = "text")
    private String diagnosis;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Prescription> prescriptions = new LinkedHashSet<>();

    protected MedicalRecord() {}

    public MedicalRecord(Appointment appointment, String diagnosis, String notes) {
        this.appointment = appointment;
        this.diagnosis = diagnosis;
        this.notes = notes;
    }

    public void addPrescription(Prescription prescription) {
        prescriptions.add(prescription);
        prescription.setMedicalRecord(this);
    }

    public Long getId() { return id; }
    public Appointment getAppointment() { return appointment; }
    public String getDiagnosis() { return diagnosis; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Set<Prescription> getPrescriptions() { return prescriptions; }
}
