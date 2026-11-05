package com.hospital.service;
import com.hospital.domain.Doctor;
import com.hospital.dto.ApiDtos.*;
import com.hospital.exception.ApiException;
import com.hospital.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
@Service public class DoctorService{
 private final DoctorRepository doctors;private final AvailabilityRepository availability;
 public DoctorService(DoctorRepository d,AvailabilityRepository a){doctors=d;availability=a;}
 public List<DoctorResponse> search(String q,String spec){return doctors.search(blank(q),blank(spec)).stream().map(this::dto).toList();}
 public List<AvailabilityResponse> availability(Long id){if(!doctors.existsById(id))throw new ApiException(HttpStatus.NOT_FOUND,"Doctor not found");return availability.findByDoctorIdAndStartsAtAfterOrderByStartsAt(id,Instant.now()).stream().map(a->new AvailabilityResponse(a.getId(),a.getStartsAt(),a.getEndsAt())).toList();}
 private DoctorResponse dto(Doctor d){return new DoctorResponse(d.getId(),d.getUser().getFullName(),d.getUser().getEmail(),d.getSpecialization().getName(),d.getBio());}
 private String blank(String s){return s==null||s.isBlank()?null:s.trim();}
}
