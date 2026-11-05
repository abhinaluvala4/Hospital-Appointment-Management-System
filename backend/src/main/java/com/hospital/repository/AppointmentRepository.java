package com.hospital.repository;
import com.hospital.domain.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
public interface AppointmentRepository extends JpaRepository<Appointment,Long>{
 boolean existsByDoctorIdAndStartsAtAndStatusIn(Long doctorId,Instant startsAt,java.util.Collection<com.hospital.domain.AppointmentStatus> statuses);
 List<Appointment> findByPatientUserIdOrderByStartsAtDesc(Long userId);
 List<Appointment> findByDoctorUserIdOrderByStartsAtDesc(Long userId);
 java.util.Optional<Appointment> findByIdAndDoctorUserId(Long id,Long userId);
 boolean existsByDoctorUserIdAndPatientId(Long doctorUserId,Long patientId);
}
