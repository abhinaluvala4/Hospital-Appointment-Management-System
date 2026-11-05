package com.hospital.service;

import com.hospital.domain.*;
import com.hospital.dto.ApiDtos.*;
import com.hospital.exception.ApiException;
import com.hospital.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Service
public class DoctorClinicalService {
    private final AppointmentRepository appointments;
    private final MedicalRecordRepository records;
    private final MedicationRepository medications;
    private final PatientRepository patients;

    public DoctorClinicalService(AppointmentRepository appointments, MedicalRecordRepository records, MedicationRepository medications,
                                 PatientRepository patients) {
        this.appointments = appointments;
        this.records = records;
        this.medications = medications;
        this.patients = patients;
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> ownPatientHistory(Long patientUserId) {
        Patient patient = patients.findByUserId(patientUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Patient not found"));
        return records.findPatientHistory(patient.getId()).stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> patientHistory(Long doctorUserId, Long patientId) {
        if (!appointments.existsByDoctorUserIdAndPatientId(doctorUserId, patientId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Patient not found");
        }
        return records.findPatientHistory(patientId).stream().map(this::response).toList();
    }

    @Transactional
    public MedicalRecordResponse saveRecord(Long doctorUserId, Long appointmentId, MedicalRecordRequest request) {
        Appointment appointment = appointments.findByIdAndDoctorUserId(appointmentId, doctorUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (!appointment.getStartsAt().isBefore(Instant.now())
                || appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.RESCHEDULED) {
            throw new ApiException(HttpStatus.CONFLICT, "Medical records can only be saved for past, active appointments");
        }

        MedicalRecord record = records.findByAppointmentId(appointmentId)
                .map(existing -> {
                    if (!existing.getDiagnosis().equals(request.diagnosis().trim())
                            || !java.util.Objects.equals(existing.getNotes(), normalize(request.notes()))) {
                        throw new ApiException(HttpStatus.CONFLICT, "A medical record already exists for this appointment");
                    }
                    return existing;
                })
                .orElseGet(() -> records.save(new MedicalRecord(appointment, request.diagnosis().trim(), normalize(request.notes()))));
        appointment.complete();
        return response(record);
    }

    @Transactional
    public MedicalRecordResponse addPrescription(Long doctorUserId, Long recordId, PrescriptionRequest request) {
        MedicalRecord record = records.findDetailedById(recordId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Medical record not found"));
        if (!record.getAppointment().getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Medical record not found");
        }

        Prescription prescription = new Prescription(normalize(request.instructions()));
        for (PrescriptionItemRequest item : request.items()) {
            String medicationName = item.medication().trim();
            Medication medication = medications.findByNameIgnoreCase(medicationName)
                    .orElseGet(() -> medications.save(new Medication(medicationName)));
            prescription.addItem(new PrescriptionItem(medication, item.dosage().trim(), item.frequency().trim(), item.durationDays()));
        }
        record.addPrescription(prescription);
        return response(record);
    }

    private MedicalRecordResponse response(MedicalRecord record) {
        Appointment appointment = record.getAppointment();
        return new MedicalRecordResponse(
                record.getId(),
                appointment.getId(),
                appointment.getDoctor().getUser().getId(),
                appointment.getDoctor().getUser().getFullName(),
                appointment.getStartsAt(),
                record.getDiagnosis(),
                record.getNotes(),
                record.getCreatedAt(),
                record.getPrescriptions().stream().map(prescription -> new PrescriptionResponse(
                        prescription.getId(),
                        prescription.getIssuedAt(),
                        prescription.getInstructions(),
                        prescription.getItems().stream().map(item -> new PrescriptionItemResponse(
                                item.getId(),
                                item.getMedication().getName(),
                                item.getDosage(),
                                item.getFrequency(),
                                item.getDurationDays()
                        )).toList()
                )).toList()
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
