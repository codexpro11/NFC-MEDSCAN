package org.yolo.nfc.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yolo.nfc.Patient;
import org.yolo.nfc.Repo.PatientRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {
    
    private final PatientRepository patientRepository;
    
    @Transactional(readOnly = true)
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Patient> getPatientByNfcId(String nfcId) {
        return patientRepository.findByNfcId(nfcId);
    }
    
    @Transactional
    public Patient createPatient(Patient patient) {
        if (patientRepository.existsByNfcId(patient.getNfcId())) {
            throw new RuntimeException("Patient with NFC ID already exists");
        }
        return patientRepository.save(patient);
    }
    
    @Transactional
    public Patient updatePatient(Long id, Patient patient) {
        Patient existingPatient = patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        existingPatient.setName(patient.getName());
        existingPatient.setAge(patient.getAge());
        existingPatient.setBloodGroup(patient.getBloodGroup());
        existingPatient.setDateOfBirth(patient.getDateOfBirth());
        existingPatient.setLastCheckup(patient.getLastCheckup());
        existingPatient.setDataConsentEnabled(patient.isDataConsentEnabled());
        existingPatient.setEmergencyOverride(patient.isEmergencyOverride());

        // FIX: @ElementCollection fields MUST be updated by clearing the existing
        // Hibernate-managed collection and adding new items into it.
        // Simply calling setAllergies(newList) replaces the collection reference,
        // which Hibernate may NOT mark as dirty — causing the update to be silently dropped.
        updateCollection(existingPatient.getAllergies(), patient.getAllergies());
        updateCollection(existingPatient.getMedicalConditions(), patient.getMedicalConditions());
        updateCollection(existingPatient.getCurrentMedications(), patient.getCurrentMedications());

        // Insurance: cascade = ALL handles insert/update of the child record
        existingPatient.setInsurance(patient.getInsurance());

        // EmergencyContacts: re-link each contact back to this patient
        // (the @JsonIgnore on EmergencyContact.patient means the FK is stripped in transit)
        if (patient.getEmergencyContacts() != null) {
            patient.getEmergencyContacts().forEach(ec -> ec.setPatient(existingPatient));
            existingPatient.setEmergencyContacts(patient.getEmergencyContacts());
        }
        
        return patientRepository.save(existingPatient);
    }

    /**
     * Safely update a Hibernate-managed @ElementCollection list.
     * Modifies the EXISTING list in-place (clear + addAll) so Hibernate can track
     * the change and issue the correct DELETE + INSERT SQL within the transaction.
     */
    private void updateCollection(List<String> existing, List<String> incoming) {
        if (existing == null) return;
        existing.clear();
        if (incoming != null && !incoming.isEmpty()) {
            existing.addAll(incoming);
        }
    }
    
    @Transactional
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}
