package com.hospital.service;
import com.hospital.domain.*;
import com.hospital.dto.AuthDtos.*;
import com.hospital.exception.ApiException;
import com.hospital.repository.*;
import com.hospital.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
 private final UserRepository users;private final PatientRepository patients;private final PasswordEncoder encoder;private final JwtService jwt;
 public AuthService(UserRepository users,PatientRepository patients,PasswordEncoder encoder,JwtService jwt){this.users=users;this.patients=patients;this.encoder=encoder;this.jwt=jwt;}
 @Transactional public AuthResponse register(RegisterRequest r){String email=r.email().trim().toLowerCase();if(users.findByEmailIgnoreCase(email).isPresent())throw new ApiException(HttpStatus.CONFLICT,"An account with that email already exists");User u=users.save(new User(r.fullName().trim(),email,encoder.encode(r.password()),Role.PATIENT));patients.save(new Patient(u));return response(u);}
 public AuthResponse login(LoginRequest r){User u=users.findByEmailIgnoreCase(r.email().trim()).filter(User::isActive).orElseThrow(()->new ApiException(HttpStatus.UNAUTHORIZED,"Invalid email or password"));if(!encoder.matches(r.password(),u.getPasswordHash()))throw new ApiException(HttpStatus.UNAUTHORIZED,"Invalid email or password");return response(u);}
 private AuthResponse response(User u){return new AuthResponse(jwt.issue(u),"Bearer",jwt.getExpirationSeconds(),u.getId(),u.getFullName(),u.getEmail(),u.getRole());}
}
