package com.hospital.config;
import com.hospital.security.JwtAuthFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.ApiDtos.ErrorResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration @EnableMethodSecurity
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean SecurityFilterChain filterChain(HttpSecurity http,JwtAuthFilter jwt,ObjectMapper mapper)throws Exception{
  AuthenticationEntryPoint unauthorized=(request,response,error)->{response.setStatus(401);response.setContentType("application/json");mapper.writeValue(response.getOutputStream(),new ErrorResponse(java.time.Instant.now(),401,"Unauthorized","Authentication is required",request.getRequestURI()));};
  AccessDeniedHandler forbidden=(request,response,error)->{response.setStatus(403);response.setContentType("application/json");mapper.writeValue(response.getOutputStream(),new ErrorResponse(java.time.Instant.now(),403,"Forbidden","You are not allowed to access this resource",request.getRequestURI()));};
  return http.csrf(c->c.disable()).cors(c->{}).exceptionHandling(e->e.authenticationEntryPoint(unauthorized).accessDeniedHandler(forbidden)).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).authorizeHttpRequests(a->a.requestMatchers("/api/auth/**","/api/doctors/**","/swagger-ui/**","/swagger-ui.html","/v3/api-docs/**").permitAll().anyRequest().authenticated()).addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class).build();
 }
 @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origin}") String origin){CorsConfiguration c=new CorsConfiguration();c.setAllowedOrigins(List.of(origin));c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","OPTIONS"));c.setAllowedHeaders(List.of("Authorization","Content-Type"));c.setAllowCredentials(false);UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource();s.registerCorsConfiguration("/api/**",c);return s;}
}
