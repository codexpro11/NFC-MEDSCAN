package org.yolo.nfc.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yolo.nfc.Patient;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByNfcId(String nfcId);
    boolean existsByNfcId(String nfcId);
}
