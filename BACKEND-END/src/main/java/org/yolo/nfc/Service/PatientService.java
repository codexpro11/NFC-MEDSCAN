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
        existingPatient.setAllergies(patient.getAllergies());
        existingPatient.setMedicalConditions(patient.getMedicalConditions());
        existingPatient.setCurrentMedications(patient.getCurrentMedications());
        existingPatient.setLastCheckup(patient.getLastCheckup());
        existingPatient.setInsurance(patient.getInsurance());
        existingPatient.setEmergencyContacts(patient.getEmergencyContacts());
        existingPatient.setDataConsentEnabled(patient.isDataConsentEnabled());
        existingPatient.setEmergencyOverride(patient.isEmergencyOverride());
        
        return patientRepository.save(existingPatient);
    }
    
    @Transactional
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}
