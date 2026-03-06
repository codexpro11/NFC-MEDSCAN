package org.yolo.nfc;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.yolo.nfc.Repo.AppUserRepository;
import org.yolo.nfc.Service.AccessLogService;
import org.yolo.nfc.Service.AIService;
import org.yolo.nfc.Service.PatientService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
// NOTE: No @CrossOrigin here - global CORS is configured in SecurityConfig
public class PatientController {

    private final PatientService patientService;
    private final AIService aiService;
    private final AccessLogService accessLogService;
    private final AppUserRepository appUserRepository;

    // Staff-only: only hospital staff should be able to list all patients
    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/nfc/{nfcId}")
    public ResponseEntity<Patient> getPatientByNfcId(@PathVariable String nfcId,
            Authentication authentication) {
        return patientService.getPatientByNfcId(nfcId)
                .map(patient -> {
                    // Respect consent flag
                    if (!patient.isDataConsentEnabled()) {
                        return ResponseEntity.status(403).<Patient>build();
                    }

                    // Log access if staff is authenticated
                    if (authentication != null) {
                        accessLogService.logAccess(patient, authentication, AccessLog.Action.NFC_SCAN);
                    }

                    return ResponseEntity.ok(patient);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{nfcId}/ai-suggestions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, List<String>>> getAISuggestions(@PathVariable String nfcId,
            Authentication authentication) {
        return patientService.getPatientByNfcId(nfcId)
                .map(patient -> {
                    if (!patient.isDataConsentEnabled()) {
                        return ResponseEntity.status(403).<Map<String, List<String>>>build();
                    }
                    if (authentication != null) {
                        accessLogService.logAccess(patient, authentication, AccessLog.Action.PROFILE_VIEW);
                    }
                    List<String> suggestions = aiService.generateClinicalSuggestions(patient);
                    Map<String, List<String>> response = new HashMap<>();
                    response.put("suggestions", suggestions);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Staff can create any patient record.
    // PATIENT can create only their own record, and only for their linked NFC ID.
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient,
            Authentication authentication) {
        try {
            AppUser currentUser = appUserRepository.findByEmail(authentication.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == AppUser.Role.PATIENT) {
                String linkedNfcId = currentUser.getLinkedNfcId();
                if (linkedNfcId == null || linkedNfcId.isBlank()
                        || patient.getNfcId() == null
                        || !linkedNfcId.equalsIgnoreCase(patient.getNfcId().trim())) {
                    return ResponseEntity.status(403).build();
                }
            }
            Patient createdPatient = patientService.createPatient(patient);
            return ResponseEntity.ok(createdPatient);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patient,
            Authentication authentication) {
        try {
            // Patients can only update their own record; staff can update any
            AppUser currentUser = appUserRepository.findByEmail(authentication.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == AppUser.Role.PATIENT) {
                // Verify the patient is updating their own record
                patientService.getPatientByNfcId(currentUser.getLinkedNfcId())
                        .filter(p -> p.getId().equals(id))
                        .orElseThrow(() -> new RuntimeException("Access denied"));
            }
            Patient updatedPatient = patientService.updatePatient(id, patient);
            return ResponseEntity.ok(updatedPatient);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    // Staff / Admin only: patients should not be able to delete records
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint to link an NFC card to the logged-in patient account
    @PutMapping("/link-nfc")
    public ResponseEntity<Void> linkNfcCard(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        try {
            String nfcId = payload.get("nfcId");
            if (nfcId == null || nfcId.isBlank()) {
                return ResponseEntity.badRequest().build();
            }
            AppUser user = appUserRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setLinkedNfcId(nfcId.trim());
            appUserRepository.save(user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
