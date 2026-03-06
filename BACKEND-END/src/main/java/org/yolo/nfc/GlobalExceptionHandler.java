package org.yolo.nfc;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * FIX: Extends ResponseEntityExceptionHandler so that this class takes FULL control
 * of ALL Spring MVC built-in exception handling (HttpMessageNotReadableException,
 * MethodArgumentNotValidException, etc.).
 *
 * Without this, Spring Boot 3's DefaultHandlerExceptionResolver intercepts those
 * exceptions first and returns empty response bodies (content-length: 0) because
 * it doesn't know how to write a JSON body — only our handler does.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    // Override to return our custom JSON body for @Valid failures
    // (MethodArgumentNotValidException — e.g. missing required fields, short password)
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", fieldErrors);
    }

    // Wrong password — Spring Security exception, must be 401 not 400
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials(BadCredentialsException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password", null);
    }

    // Disabled account
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Object> handleDisabled(DisabledException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Account is disabled. Please contact support.", null);
    }

    // Role-based access denial
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied: insufficient permissions", null);
    }

    // General business logic errors (duplicate email, invalid role, Google user guard, etc.)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    private ResponseEntity<Object> buildResponse(HttpStatus status, String message, Object details) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", message);
        if (details != null) {
            body.put("details", details);
        }
        return ResponseEntity.status(status).body(body);
    }
}
