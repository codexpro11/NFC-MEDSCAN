package org.yolo.nfc;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.yolo.nfc.Repo.AccessLogRepository;
import org.yolo.nfc.Repo.AppUserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/access-logs")
@RequiredArgsConstructor
public class AccessLogController {

    private final AccessLogRepository accessLogRepository;
    private final AppUserRepository appUserRepository;

    /**
     * Patient sees who accessed their own data.
     * Staff can look up any patient's log (for audit purposes).
     * A patient can ONLY see their own NFC ID's logs — enforced here.
     */
    @GetMapping("/patient/{nfcId}")
    public ResponseEntity<List<AccessLog>> getByPatient(@PathVariable String nfcId,
            Authentication authentication) {
        AppUser currentUser = appUserRepository.findByEmail(authentication.getName()).orElse(null);

        if (currentUser != null && currentUser.getRole() == AppUser.Role.PATIENT) {
            // Patients can only see their own access log
            if (!nfcId.equals(currentUser.getLinkedNfcId())) {
                return ResponseEntity.status(403).build();
            }
        }
        // Staff roles (DOCTOR, NURSE, ADMIN, RECEPTIONIST) can see any patient's log
        return ResponseEntity.ok(accessLogRepository.findByPatient_NfcIdOrderByAccessedAtDesc(nfcId));
    }

    /**
     * Hospital staff can see their own hospital's scan activity.
     * Only ADMIN can see any hospital's logs; other staff only their own hospital.
     */
    @GetMapping("/hospital/{hospitalId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<AccessLog>> getByHospital(@PathVariable Long hospitalId,
            Authentication authentication) {
        AppUser currentUser = appUserRepository.findByEmail(authentication.getName()).orElse(null);

        if (currentUser == null) return ResponseEntity.status(401).build();

        // Non-admin staff can only see their own hospital's logs
        if (currentUser.getRole() != AppUser.Role.ADMIN) {
            if (currentUser.getHospital() == null ||
                    !currentUser.getHospital().getId().equals(hospitalId)) {
                return ResponseEntity.status(403).build();
            }
        }

        return ResponseEntity.ok(accessLogRepository.findByHospital_Id(hospitalId));
    }
}
