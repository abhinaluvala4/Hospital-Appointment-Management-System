package com.hospital.controller;

import com.hospital.dto.ApiDtos.MedicalRecordResponse;
import com.hospital.service.DoctorClinicalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientClinicalController {
    private final DoctorClinicalService service;

    public PatientClinicalController(DoctorClinicalService service) {
        this.service = service;
    }

    @GetMapping("/medical-records")
    public List<MedicalRecordResponse> ownHistory(Authentication authentication) {
        return service.ownPatientHistory((Long) authentication.getDetails());
    }
}
