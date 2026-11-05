package com.hospital.dto;
import com.hospital.domain.Role;
import jakarta.validation.constraints.*;
public final class AuthDtos {
 private AuthDtos(){}
 public record RegisterRequest(@NotBlank @Size(max=120) String fullName,@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=10,max=72) String password){}
 public record LoginRequest(@NotBlank @Email String email,@NotBlank String password){}
 public record AuthResponse(String token,String tokenType,long expiresInSeconds,long userId,String fullName,String email,Role role){}
}
