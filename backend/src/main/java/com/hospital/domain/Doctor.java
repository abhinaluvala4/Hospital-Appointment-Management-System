package com.hospital.domain;
import jakarta.persistence.*;
@Entity @Table(name="doctors")
public class Doctor {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false,unique=true) private User user;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="specialization_id",nullable=false) private Specialization specialization;
 @Column(length=1000) private String bio;
 @Column(nullable=false) private boolean active=true;
 protected Doctor() {}
 public Long getId(){return id;} public User getUser(){return user;} public Specialization getSpecialization(){return specialization;} public String getBio(){return bio;} public boolean isActive(){return active;}
}
