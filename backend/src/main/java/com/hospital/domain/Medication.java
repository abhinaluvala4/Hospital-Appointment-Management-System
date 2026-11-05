package com.hospital.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "medications")
public class Medication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 160)
    private String name;

    @Column(length = 500)
    private String description;

    protected Medication() {}

    public Medication(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}
