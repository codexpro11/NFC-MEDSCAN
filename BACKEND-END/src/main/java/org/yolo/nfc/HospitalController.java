package org.yolo.nfc;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.yolo.nfc.Repo.HospitalRepository;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalRepository hospitalRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Hospital>> getAll() {
        return ResponseEntity.ok(hospitalRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getById(@PathVariable Long id) {
        return hospitalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Hospital> create(@RequestBody Hospital hospital) {
        if (hospitalRepository.existsByEmail(hospital.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        hospital.setApiKey(UUID.randomUUID().toString());
        return ResponseEntity.ok(hospitalRepository.save(hospital));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hospitalRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
