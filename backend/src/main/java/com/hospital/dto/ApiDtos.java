package com.hospital.dto;
import com.hospital.domain.AppointmentStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
public final class ApiDtos {
 private ApiDtos(){}
 public record DoctorResponse(Long id,String name,String email,String specialization,String bio){}
 public record AvailabilityResponse(Long id,Instant startsAt,Instant endsAt){}
 public record BookAppointmentRequest(@NotNull Long doctorId,@NotNull @Future Instant startsAt,@Size(max=500) String reason){}
 public record AppointmentResponse(Long id,Long doctorId,String doctorName,Long patientId,String patientName,Instant startsAt,Instant endsAt,AppointmentStatus status,String reason){}
 public record MedicalRecordRequest(@jakarta.validation.constraints.NotBlank @Size(max=10000) String diagnosis,@Size(max=10000) String notes){}
 public record PrescriptionRequest(@Size(max=2000) String instructions,@jakarta.validation.constraints.NotEmpty List<@jakarta.validation.Valid PrescriptionItemRequest> items){}
 public record PrescriptionItemRequest(@jakarta.validation.constraints.NotBlank @Size(max=160) String medication,@jakarta.validation.constraints.NotBlank @Size(max=120) String dosage,@jakarta.validation.constraints.NotBlank @Size(max=120) String frequency,@jakarta.validation.constraints.Positive Integer durationDays){}
 public record MedicalRecordResponse(Long id,Long appointmentId,Long doctorUserId,String doctorName,Instant appointmentStartsAt,String diagnosis,String notes,Instant createdAt,List<PrescriptionResponse> prescriptions){}
 public record PrescriptionResponse(Long id,Instant issuedAt,String instructions,List<PrescriptionItemResponse> items){}
 public record PrescriptionItemResponse(Long id,String medication,String dosage,String frequency,Integer durationDays){}
 public record ErrorResponse(Instant timestamp,int status,String error,String message,String path){}
}
