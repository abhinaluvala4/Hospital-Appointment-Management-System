package com.hospital.domain;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="doctor_availability")
public class DoctorAvailability {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="doctor_id",nullable=false) private Doctor doctor;
 @Column(name="starts_at",nullable=false) private Instant startsAt;
 @Column(name="ends_at",nullable=false) private Instant endsAt;
 protected DoctorAvailability() {}
 public Long getId(){return id;} public Doctor getDoctor(){return doctor;} public Instant getStartsAt(){return startsAt;} public Instant getEndsAt(){return endsAt;}
}
