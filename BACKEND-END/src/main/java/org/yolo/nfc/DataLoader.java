package org.yolo.nfc;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.yolo.nfc.Repo.PatientRepository;

import java.time.LocalDate;
import java.util.Arrays;

@Component
@Profile("!prod") // Never seed sample data in production
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    
    private final PatientRepository patientRepository;
    
    @Override
    public void run(String... args) {
        if (patientRepository.count() == 0) {
            loadSampleData();
        }
    }
    
    private void loadSampleData() {
        // Patient 1
        Patient patient1 = new Patient();
        patient1.setNfcId("NFC001");
        patient1.setName("John Davis");
        patient1.setAge(45);
        patient1.setBloodGroup("O-");
        patient1.setAllergies(Arrays.asList("Penicillin", "Aspirin"));
        patient1.setMedicalConditions(Arrays.asList("Type 2 Diabetes", "Hypertension"));
        patient1.setCurrentMedications(Arrays.asList("Metformin 500mg", "Lisinopril 10mg"));
        patient1.setLastCheckup(LocalDate.of(2024, 8, 15));
        
        Insurance insurance1 = new Insurance();
        insurance1.setProvider("BlueCross BlueShield");
        insurance1.setPolicyNumber("BC-2024-987654");
        insurance1.setGroupNumber("GRP-45892");
        insurance1.setCoverage("Comprehensive Premium");
        patient1.setInsurance(insurance1);
        
        EmergencyContact contact1_1 = new EmergencyContact();
        contact1_1.setName("Sarah Davis");
        contact1_1.setRelation("Spouse");
        contact1_1.setPhone("+1-555-0101");
        contact1_1.setPatient(patient1);
        
        EmergencyContact contact1_2 = new EmergencyContact();
        contact1_2.setName("Dr. Robert Smith");
        contact1_2.setRelation("Primary Care");
        contact1_2.setPhone("+1-555-0102");
        contact1_2.setPatient(patient1);
        
        patient1.setEmergencyContacts(Arrays.asList(contact1_1, contact1_2));
        
        // Patient 2
        Patient patient2 = new Patient();
        patient2.setNfcId("NFC002");
        patient2.setName("Emma Wilson");
        patient2.setAge(32);
        patient2.setBloodGroup("A+");
        patient2.setAllergies(Arrays.asList("Shellfish", "Latex"));
        patient2.setMedicalConditions(Arrays.asList("Asthma", "Anxiety Disorder"));
        patient2.setCurrentMedications(Arrays.asList("Albuterol inhaler", "Sertraline 50mg"));
        patient2.setLastCheckup(LocalDate.of(2024, 9, 20));
        
        Insurance insurance2 = new Insurance();
        insurance2.setProvider("Aetna Health");
        insurance2.setPolicyNumber("AET-2024-554321");
        insurance2.setGroupNumber("GRP-32156");
        insurance2.setCoverage("HMO Plus");
        patient2.setInsurance(insurance2);
        
        EmergencyContact contact2_1 = new EmergencyContact();
        contact2_1.setName("Michael Wilson");
        contact2_1.setRelation("Brother");
        contact2_1.setPhone("+1-555-0201");
        contact2_1.setPatient(patient2);
        
        EmergencyContact contact2_2 = new EmergencyContact();
        contact2_2.setName("Dr. Lisa Chen");
        contact2_2.setRelation("Primary Care");
        contact2_2.setPhone("+1-555-0202");
        contact2_2.setPatient(patient2);
        
        patient2.setEmergencyContacts(Arrays.asList(contact2_1, contact2_2));
        
        // Patient 3
        Patient patient3 = new Patient();
        patient3.setNfcId("NFC003");
        patient3.setName("Robert Martinez");
        patient3.setAge(58);
        patient3.setBloodGroup("B+");
        patient3.setAllergies(Arrays.asList("NSAIDs", "Codeine"));
        patient3.setMedicalConditions(Arrays.asList("Coronary Artery Disease", "Atrial Fibrillation"));
        patient3.setCurrentMedications(Arrays.asList("Warfarin 5mg", "Metoprolol 50mg", "Atorvastatin 40mg"));
        patient3.setLastCheckup(LocalDate.of(2024, 9, 10));
        
        Insurance insurance3 = new Insurance();
        insurance3.setProvider("United Healthcare");
        insurance3.setPolicyNumber("UNI-2024-112233");
        insurance3.setGroupNumber("GRP-58902");
        insurance3.setCoverage("PPO Select");
        patient3.setInsurance(insurance3);
        
        EmergencyContact contact3_1 = new EmergencyContact();
        contact3_1.setName("Carlos Martinez");
        contact3_1.setRelation("Son");
        contact3_1.setPhone("+1-555-0301");
        contact3_1.setPatient(patient3);
        
        EmergencyContact contact3_2 = new EmergencyContact();
        contact3_2.setName("Dr. James Anderson");
        contact3_2.setRelation("Cardiologist");
        contact3_2.setPhone("+1-555-0302");
        contact3_2.setPatient(patient3);
        
        patient3.setEmergencyContacts(Arrays.asList(contact3_1, contact3_2));
        
        // Save all patients
        patientRepository.saveAll(Arrays.asList(patient1, patient2, patient3));
        
        System.out.println("Sample data loaded successfully!");
    }
}
