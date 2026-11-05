package com.hospital.service;
import com.hospital.domain.*;
import com.hospital.dto.ApiDtos.*;
import com.hospital.exception.ApiException;
import com.hospital.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service public class AppointmentService{
 private final AppointmentRepository appointments;private final PatientRepository patients;private final DoctorRepository doctors;private final AvailabilityRepository availability;
 public AppointmentService(AppointmentRepository a,PatientRepository p,DoctorRepository d,AvailabilityRepository v){appointments=a;patients=p;doctors=d;availability=v;}
 @Transactional public AppointmentResponse book(Long userId,BookAppointmentRequest r){
  if(r.startsAt()==null||!r.startsAt().isAfter(Instant.now()))throw new ApiException(HttpStatus.BAD_REQUEST,"Appointment time must be in the future");
  Patient patient=patients.findByUserId(userId).orElseThrow(()->new ApiException(HttpStatus.FORBIDDEN,"Patient account required"));
  Doctor doctor=doctors.findById(r.doctorId()).filter(Doctor::isActive).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Doctor not found"));
  DoctorAvailability slot=availability.findByDoctorIdAndStartsAtAfterOrderByStartsAt(doctor.getId(),Instant.now()).stream().filter(a->a.getStartsAt().equals(r.startsAt())).findFirst().orElseThrow(()->new ApiException(HttpStatus.CONFLICT,"Selected time is not published by this doctor"));
  if(appointments.existsByDoctorIdAndStartsAtAndStatusIn(doctor.getId(),r.startsAt(),List.of(AppointmentStatus.PENDING,AppointmentStatus.CONFIRMED)))throw new ApiException(HttpStatus.CONFLICT,"This appointment slot is already booked");
  try{return dto(appointments.saveAndFlush(new Appointment(patient,doctor,slot.getStartsAt(),slot.getEndsAt(),r.reason()==null?null:r.reason().trim())));}catch(DataIntegrityViolationException e){throw new ApiException(HttpStatus.CONFLICT,"This appointment slot is already booked");}
 }
 @Transactional(readOnly=true) public List<AppointmentResponse> mine(Long userId,Role role){List<Appointment> result=switch(role){case PATIENT->appointments.findByPatientUserIdOrderByStartsAtDesc(userId);case DOCTOR->appointments.findByDoctorUserIdOrderByStartsAtDesc(userId);case ADMIN->appointments.findAll();};return result.stream().map(this::dto).toList();}
 @Transactional public AppointmentResponse cancel(Long userId,Role role,Long id){Appointment a=appointments.findById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Appointment not found"));boolean owner=role==Role.PATIENT?a.getPatient().getUser().getId().equals(userId):role==Role.DOCTOR&&a.getDoctor().getUser().getId().equals(userId);if(!owner&&role!=Role.ADMIN)throw new ApiException(HttpStatus.FORBIDDEN,"You cannot change this appointment");if(a.getStatus()!=AppointmentStatus.CONFIRMED&&a.getStatus()!=AppointmentStatus.PENDING)throw new ApiException(HttpStatus.CONFLICT,"Only active appointments can be cancelled");if(Duration.between(Instant.now(),a.getStartsAt()).toHours()<24)throw new ApiException(HttpStatus.CONFLICT,"Appointments cannot be cancelled within 24 hours of their start time");a.cancel();return dto(a);}
 private AppointmentResponse dto(Appointment a){return new AppointmentResponse(a.getId(),a.getDoctor().getId(),a.getDoctor().getUser().getFullName(),a.getPatient().getId(),a.getPatient().getUser().getFullName(),a.getStartsAt(),a.getEndsAt(),a.getStatus(),a.getReason());}
}
