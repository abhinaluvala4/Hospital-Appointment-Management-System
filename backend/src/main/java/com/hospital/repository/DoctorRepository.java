
package com.hospital.repository;

import com.hospital.domain.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("""
        select d
        from Doctor d
        join fetch d.user
        join fetch d.specialization
        where d.active = true
          and (
              :q is null
              or lower(d.user.fullName) like lower(concat('%', coalesce(cast(:q as string), ''), '%'))
          )
          and (
              :spec is null
              or lower(d.specialization.name) = lower(cast(:spec as string))
          )
        """)
    List<Doctor> search(
            @Param("q") String q,
            @Param("spec") String specialization
    );

    Optional<Doctor> findByUserId(Long userId);
}
