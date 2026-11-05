package com.hospital.controller;
import com.hospital.dto.ApiDtos.*;
import com.hospital.service.DoctorService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/doctors")
public class DoctorController{
 private final DoctorService service;public DoctorController(DoctorService s){service=s;}
 @GetMapping public List<DoctorResponse> search(@RequestParam(required=false) String q,@RequestParam(required=false) String specialization){return service.search(q,specialization);}
 @GetMapping("/{id}/availability") public List<AvailabilityResponse> availability(@PathVariable Long id){return service.availability(id);}
}
