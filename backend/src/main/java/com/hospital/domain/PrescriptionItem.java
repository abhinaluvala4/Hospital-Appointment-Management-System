package com.hospital.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "prescription_items")
public class PrescriptionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(nullable = false, length = 120)
    private String dosage;

    @Column(nullable = false, length = 120)
    private String frequency;

    @Column(name = "duration_days")
    private Integer durationDays;

    protected PrescriptionItem() {}

    public PrescriptionItem(Medication medication, String dosage, String frequency, Integer durationDays) {
        this.medication = medication;
        this.dosage = dosage;
        this.frequency = frequency;
        this.durationDays = durationDays;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public Long getId() { return id; }
    public Medication getMedication() { return medication; }
    public String getDosage() { return dosage; }
    public String getFrequency() { return frequency; }
    public Integer getDurationDays() { return durationDays; }
}
