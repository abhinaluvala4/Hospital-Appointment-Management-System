package com.hospital.exception;
import com.hospital.dto.ApiDtos.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {
 @ExceptionHandler(ApiException.class) ResponseEntity<ErrorResponse> api(ApiException e,HttpServletRequest r){return response(e.getStatus(),e.getMessage(),r);}
 @ExceptionHandler({MethodArgumentNotValidException.class,ConstraintViolationException.class}) ResponseEntity<ErrorResponse> validation(Exception e,HttpServletRequest r){return response(HttpStatus.BAD_REQUEST,"Request validation failed",r);}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<ErrorResponse> conflict(Exception e,HttpServletRequest r){return response(HttpStatus.CONFLICT,"The requested data conflicts with an existing record",r);}
 private ResponseEntity<ErrorResponse> response(HttpStatus s,String message,HttpServletRequest r){return ResponseEntity.status(s).body(new ErrorResponse(Instant.now(),s.value(),s.getReasonPhrase(),message,r.getRequestURI()));}
}
