package com.hospital.domain;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="patients")
public class Patient {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id",nullable=false,unique=true) private User user;
 private String phone;
 @Column(name="date_of_birth") private LocalDate dateOfBirth;
 protected Patient() {}
 public Patient(User user){this.user=user;}
 public Long getId(){return id;} public User getUser(){return user;}
}
