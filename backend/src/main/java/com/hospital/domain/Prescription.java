package com.hospital.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "prescriptions")
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt = Instant.now();

    @Column(columnDefinition = "text")
    private String instructions;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PrescriptionItem> items = new LinkedHashSet<>();

    protected Prescription() {}

    public Prescription(String instructions) {
        this.instructions = instructions;
    }

    public void addItem(PrescriptionItem item) {
        items.add(item);
        item.setPrescription(this);
    }

    public void setMedicalRecord(MedicalRecord medicalRecord) {
        this.medicalRecord = medicalRecord;
    }

    public Long getId() { return id; }
    public Instant getIssuedAt() { return issuedAt; }
    public String getInstructions() { return instructions; }
    public Set<PrescriptionItem> getItems() { return items; }
}
