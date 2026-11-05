package com.hospital.controller;

import com.hospital.dto.ApiDtos.*;
import com.hospital.service.DoctorClinicalService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorClinicalController {
    private final DoctorClinicalService service;

    public DoctorClinicalController(DoctorClinicalService service) {
        this.service = service;
    }

    @GetMapping("/patients/{patientId}/medical-records")
    public List<MedicalRecordResponse> patientHistory(Authentication authentication, @PathVariable Long patientId) {
        return service.patientHistory(userId(authentication), patientId);
    }

    @PutMapping("/appointments/{appointmentId}/medical-record")
    public MedicalRecordResponse saveRecord(Authentication authentication, @PathVariable Long appointmentId,
                                             @Valid @RequestBody MedicalRecordRequest request) {
        return service.saveRecord(userId(authentication), appointmentId, request);
    }

    @PostMapping("/medical-records/{recordId}/prescriptions")
    public MedicalRecordResponse addPrescription(Authentication authentication, @PathVariable Long recordId,
                                                  @Valid @RequestBody PrescriptionRequest request) {
        return service.addPrescription(userId(authentication), recordId, request);
    }

    private Long userId(Authentication authentication) {
        return (Long) authentication.getDetails();
    }
}
