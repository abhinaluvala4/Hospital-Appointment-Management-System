package com.hospital.service;

import com.hospital.domain.*;
import com.hospital.exception.ApiException;
import com.hospital.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DoctorClinicalServiceTest {
    @Test
    void doctorCannotReadHistoryForUnassignedPatient() {
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        MedicalRecordRepository records = mock(MedicalRecordRepository.class);
        MedicationRepository medications = mock(MedicationRepository.class);
        PatientRepository patients = mock(PatientRepository.class);
        when(appointments.existsByDoctorUserIdAndPatientId(7L, 12L)).thenReturn(false);

        DoctorClinicalService service = new DoctorClinicalService(appointments, records, medications, patients);
        ApiException error = assertThrows(ApiException.class, () -> service.patientHistory(7L, 12L));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
        verifyNoInteractions(records);
    }

    @Test
    void patientHistoryIsResolvedOnlyFromTheAuthenticatedUser() {
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        MedicalRecordRepository records = mock(MedicalRecordRepository.class);
        MedicationRepository medications = mock(MedicationRepository.class);
        PatientRepository patients = mock(PatientRepository.class);
        when(patients.findByUserId(7L)).thenReturn(java.util.Optional.empty());

        DoctorClinicalService service = new DoctorClinicalService(appointments, records, medications, patients);
        ApiException error = assertThrows(ApiException.class, () -> service.ownPatientHistory(7L));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
        verifyNoInteractions(records);
    }

    @Test
    void patientHistoryQueriesOnlyTheResolvedPatientRecordSet() {
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        MedicalRecordRepository records = mock(MedicalRecordRepository.class);
        MedicationRepository medications = mock(MedicationRepository.class);
        PatientRepository patients = mock(PatientRepository.class);
        Patient patient = mock(Patient.class);
        when(patients.findByUserId(7L)).thenReturn(java.util.Optional.of(patient));
        when(patient.getId()).thenReturn(12L);
        when(records.findPatientHistory(12L)).thenReturn(java.util.List.of());

        DoctorClinicalService service = new DoctorClinicalService(appointments, records, medications, patients);
        assertTrue(service.ownPatientHistory(7L).isEmpty());

        verify(records).findPatientHistory(12L);
        verifyNoMoreInteractions(records);
    }

    @Test
    void doctorCannotAddPrescriptionToAnotherDoctorsRecord() {
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        MedicalRecordRepository records = mock(MedicalRecordRepository.class);
        MedicationRepository medications = mock(MedicationRepository.class);
        MedicalRecord record = mock(MedicalRecord.class);
        Appointment appointment = mock(Appointment.class);
        Doctor doctor = mock(Doctor.class);
        User user = mock(User.class);
        when(records.findDetailedById(33L)).thenReturn(java.util.Optional.of(record));
        when(record.getAppointment()).thenReturn(appointment);
        when(appointment.getDoctor()).thenReturn(doctor);
        when(doctor.getUser()).thenReturn(user);
        when(user.getId()).thenReturn(8L);

        DoctorClinicalService service = new DoctorClinicalService(appointments, records, medications, mock(PatientRepository.class));
        ApiException error = assertThrows(ApiException.class,
                () -> service.addPrescription(7L, 33L, null));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
        verifyNoInteractions(medications);
    }
}
