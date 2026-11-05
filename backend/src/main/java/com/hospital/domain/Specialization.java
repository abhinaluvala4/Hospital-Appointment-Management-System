package com.hospital.domain;
import jakarta.persistence.*;
@Entity @Table(name="specializations")
public class Specialization {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,unique=true) private String name;
 protected Specialization() {}
 public Long getId(){return id;} public String getName(){return name;}
}
