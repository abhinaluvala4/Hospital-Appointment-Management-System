package com.hospital.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "full_name", nullable = false) private String fullName;
    @Column(nullable = false, unique = true) private String email;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    @Column(nullable = false) private boolean active = true;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
    protected User() {}
    public User(String fullName, String email, String passwordHash, Role role) { this.fullName=fullName; this.email=email; this.passwordHash=passwordHash; this.role=role; }
    public Long getId(){return id;} public String getFullName(){return fullName;} public String getEmail(){return email;}
    public String getPasswordHash(){return passwordHash;} public Role getRole(){return role;} public boolean isActive(){return active;}
}
