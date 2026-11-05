package com.hospital.repository;
import com.hospital.domain.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
public interface AvailabilityRepository extends JpaRepository<DoctorAvailability,Long>{ List<DoctorAvailability> findByDoctorIdAndStartsAtAfterOrderByStartsAt(Long doctorId,Instant after); }
