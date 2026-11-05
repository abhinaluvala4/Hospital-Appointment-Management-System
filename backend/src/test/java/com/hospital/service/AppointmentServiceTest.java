package com.hospital.service;
import com.hospital.domain.*;
import com.hospital.dto.ApiDtos.BookAppointmentRequest;
import com.hospital.exception.ApiException;
import com.hospital.repository.*;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AppointmentServiceTest {
 @Test void rejectsPastSlotsBeforeRepositoryLookup(){
  AppointmentRepository appointments=mock(AppointmentRepository.class);PatientRepository patients=mock(PatientRepository.class);DoctorRepository doctors=mock(DoctorRepository.class);AvailabilityRepository availability=mock(AvailabilityRepository.class);
  AppointmentService service=new AppointmentService(appointments,patients,doctors,availability);
  ApiException ex=assertThrows(ApiException.class,()->service.book(1L,new BookAppointmentRequest(1L,Instant.now().minusSeconds(1),null)));
  assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST,ex.getStatus());verifyNoInteractions(patients,doctors,availability,appointments);
 }

 @Test void rejectsAnAlreadyBookedPublishedSlot(){
  AppointmentRepository appointments=mock(AppointmentRepository.class);PatientRepository patients=mock(PatientRepository.class);DoctorRepository doctors=mock(DoctorRepository.class);AvailabilityRepository availability=mock(AvailabilityRepository.class);
  Patient patient=mock(Patient.class);Doctor doctor=mock(Doctor.class);DoctorAvailability slot=mock(DoctorAvailability.class);Instant start=Instant.now().plusSeconds(3600);
  when(patients.findByUserId(7L)).thenReturn(java.util.Optional.of(patient));when(doctors.findById(9L)).thenReturn(java.util.Optional.of(doctor));when(doctor.isActive()).thenReturn(true);when(doctor.getId()).thenReturn(9L);
  when(availability.findByDoctorIdAndStartsAtAfterOrderByStartsAt(eq(9L),any())).thenReturn(List.of(slot));when(slot.getStartsAt()).thenReturn(start);
  when(appointments.existsByDoctorIdAndStartsAtAndStatusIn(eq(9L),eq(start),any())).thenReturn(true);
  AppointmentService service=new AppointmentService(appointments,patients,doctors,availability);
  ApiException ex=assertThrows(ApiException.class,()->service.book(7L,new BookAppointmentRequest(9L,start,null)));
  assertEquals(org.springframework.http.HttpStatus.CONFLICT,ex.getStatus());verify(appointments,never()).saveAndFlush(any());
 }

 @Test void patientCannotCancelAnotherPatientsAppointment(){
  AppointmentRepository appointments=mock(AppointmentRepository.class);PatientRepository patients=mock(PatientRepository.class);DoctorRepository doctors=mock(DoctorRepository.class);AvailabilityRepository availability=mock(AvailabilityRepository.class);
  Appointment appointment=mock(Appointment.class);Patient patient=mock(Patient.class);User owner=mock(User.class);
  when(appointments.findById(22L)).thenReturn(java.util.Optional.of(appointment));when(appointment.getPatient()).thenReturn(patient);when(patient.getUser()).thenReturn(owner);when(owner.getId()).thenReturn(42L);
  when(appointment.getStatus()).thenReturn(AppointmentStatus.CONFIRMED);
  AppointmentService service=new AppointmentService(appointments,patients,doctors,availability);
  ApiException ex=assertThrows(ApiException.class,()->service.cancel(7L,Role.PATIENT,22L));
  assertEquals(org.springframework.http.HttpStatus.FORBIDDEN,ex.getStatus());verify(appointment,never()).cancel();
 }
}
