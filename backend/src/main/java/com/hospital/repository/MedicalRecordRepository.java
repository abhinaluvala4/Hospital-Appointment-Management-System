package com.hospital.repository;

import com.hospital.domain.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    @Query("""
        select distinct record
        from MedicalRecord record
        join fetch record.appointment appointment
        join fetch appointment.doctor doctor
        join fetch doctor.user
        join fetch appointment.patient patient
        join fetch patient.user
        left join fetch record.prescriptions prescription
        left join fetch prescription.items item
        left join fetch item.medication
        where patient.id = :patientId
        order by appointment.startsAt desc
        """)
    List<MedicalRecord> findPatientHistory(@Param("patientId") Long patientId);

    @Query("""
        select distinct record
        from MedicalRecord record
        join fetch record.appointment appointment
        join fetch appointment.doctor doctor
        join fetch doctor.user
        join fetch appointment.patient patient
        join fetch patient.user
        left join fetch record.prescriptions prescription
        left join fetch prescription.items item
        left join fetch item.medication
        where record.id = :recordId
        """)
    Optional<MedicalRecord> findDetailedById(@Param("recordId") Long recordId);

    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);
}
