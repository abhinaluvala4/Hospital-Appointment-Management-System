package com.hospital.domain;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="appointments")
public class Appointment {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="patient_id",nullable=false) private Patient patient;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="doctor_id",nullable=false) private Doctor doctor;
 @Column(name="starts_at",nullable=false) private Instant startsAt;
 @Column(name="ends_at",nullable=false) private Instant endsAt;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private AppointmentStatus status=AppointmentStatus.CONFIRMED;
 @Column(length=500) private String reason;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
 protected Appointment() {}
 public Appointment(Patient patient,Doctor doctor,Instant startsAt,Instant endsAt,String reason){this.patient=patient;this.doctor=doctor;this.startsAt=startsAt;this.endsAt=endsAt;this.reason=reason;}
 public void cancel(){this.status=AppointmentStatus.CANCELLED;}
 public void complete(){this.status=AppointmentStatus.COMPLETED;}
 public Long getId(){return id;} public Patient getPatient(){return patient;} public Doctor getDoctor(){return doctor;} public Instant getStartsAt(){return startsAt;} public Instant getEndsAt(){return endsAt;} public AppointmentStatus getStatus(){return status;} public String getReason(){return reason;}
}
