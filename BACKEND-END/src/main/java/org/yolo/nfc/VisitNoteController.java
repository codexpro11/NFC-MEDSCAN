package org.yolo.nfc;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.yolo.nfc.Repo.AppUserRepository;
import org.yolo.nfc.Repo.HospitalRepository;
import org.yolo.nfc.Repo.PatientRepository;
import org.yolo.nfc.Repo.VisitNoteRepository;

import java.util.List;

@RestController
@RequestMapping("/api/visit-notes")
@RequiredArgsConstructor
public class VisitNoteController {

    private final VisitNoteRepository visitNoteRepository;
    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final AppUserRepository appUserRepository;

    @GetMapping("/patient/{nfcId}")
    public ResponseEntity<List<VisitNote>> getByPatient(@PathVariable String nfcId) {
        return ResponseEntity.ok(visitNoteRepository.findByPatient_NfcIdOrderByVisitDateDesc(nfcId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<VisitNote> create(@Valid @RequestBody CreateVisitNoteRequest request,
            Authentication authentication) {
        Patient patient = patientRepository.findByNfcId(request.getNfcId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        AppUser doctor = appUserRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Use provided hospitalId, or fall back to the doctor's own hospital
        Hospital hospital;
        if (request.getHospitalId() != null) {
            hospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new RuntimeException("Hospital not found"));
        } else if (doctor.getHospital() != null) {
            hospital = doctor.getHospital();
        } else {
            throw new RuntimeException("No hospital specified and your account has no hospital assigned. Contact admin.");
        }

        VisitNote note = new VisitNote();
        note.setPatient(patient);
        note.setHospital(hospital);
        note.setDoctor(doctor);
        note.setNotes(request.getNotes());
        note.setDiagnosis(request.getDiagnosis());
        // Use provided visit date, or default to today
        note.setVisitDate(request.getVisitDate() != null ? request.getVisitDate() : java.time.LocalDate.now());

        return ResponseEntity.ok(visitNoteRepository.save(note));
    }
}
