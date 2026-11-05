package com.hospital.controller;
import com.hospital.domain.Role;
import com.hospital.dto.ApiDtos.*;
import com.hospital.service.AppointmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
@RestController @RequestMapping("/api/appointments")
public class AppointmentController{
 private final AppointmentService service;public AppointmentController(AppointmentService s){service=s;}
 @PostMapping @PreAuthorize("hasRole('PATIENT')") public AppointmentResponse book(Authentication a,@Valid @RequestBody BookAppointmentRequest r){return service.book(userId(a),r);}
 @GetMapping("/me") @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')") public List<AppointmentResponse> mine(Authentication a){return service.mine(userId(a),role(a));}
 @PatchMapping("/{id}/cancel") public AppointmentResponse cancel(Authentication a,@PathVariable Long id){return service.cancel(userId(a),role(a),id);}
 private Long userId(Authentication a){return (Long)a.getDetails();} private Role role(Authentication a){return Role.valueOf(a.getAuthorities().iterator().next().getAuthority().substring(5));}
}
