package com.hospital.repository;

import com.hospital.domain.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MedicationRepository extends JpaRepository<Medication, Long> {
    Optional<Medication> findByNameIgnoreCase(String name);
}
