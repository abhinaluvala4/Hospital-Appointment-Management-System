package com.hospital.security;
import com.hospital.domain.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
 private final SecretKey key; private final long expirationSeconds;
 public JwtService(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.expiration-minutes}") long minutes){
  if(secret.getBytes(StandardCharsets.UTF_8).length<32) throw new IllegalArgumentException("JWT secret must contain at least 32 bytes");
  this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));this.expirationSeconds=minutes*60;
 }
 public String issue(User user){Instant now=Instant.now();return Jwts.builder().subject(user.getEmail()).claim("uid",user.getId()).claim("role",user.getRole().name()).issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(expirationSeconds))).signWith(key).compact();}
 public String subject(String token){return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();}
 public long getExpirationSeconds(){return expirationSeconds;}
}
