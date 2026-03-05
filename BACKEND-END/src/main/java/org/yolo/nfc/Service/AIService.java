package org.yolo.nfc.Service;

import org.springframework.stereotype.Service;
import org.yolo.nfc.Patient;

import java.util.ArrayList;
import java.util.List;

@Service
public class AIService {
    
    public List<String> generateClinicalSuggestions(Patient patient) {
        List<String> suggestions = new ArrayList<>();
        
        // Allergy-based suggestions
        for (String allergy : patient.getAllergies()) {
            if (allergy.toLowerCase().contains("penicillin")) {
                suggestions.add("⚠️ Penicillin allergy documented - use alternative antibiotics");
            }
            if (allergy.toLowerCase().contains("aspirin")) {
                suggestions.add("⚠️ Aspirin contraindicated - patient has documented allergy");
            }
            if (allergy.toLowerCase().contains("latex")) {
                suggestions.add("⚠️ Use non-latex gloves for examination");
            }
            if (allergy.toLowerCase().contains("shellfish")) {
                suggestions.add("⚠️ Avoid Shellfish-based medications");
            }
            if (allergy.toLowerCase().contains("nsaid")) {
                suggestions.add("⚠️ NSAIDs contraindicated due to allergy");
            }
            if (allergy.toLowerCase().contains("iodine")) {
                suggestions.add("⚠️ Iodine allergy - avoid contrast agents if possible");
            }
            if (allergy.toLowerCase().contains("sulfa")) {
                suggestions.add("⚠️ Avoid Sulfa-based medications");
            }
        }
        
        // Medical condition-based suggestions
        for (String condition : patient.getMedicalConditions()) {
            if (condition.toLowerCase().contains("diabetes")) {
                suggestions.add("⚠️ Check blood glucose levels immediately - patient has diabetes");
            }
            if (condition.toLowerCase().contains("hypertension")) {
                suggestions.add("⚠️ Monitor blood pressure - patient has hypertension");
            }
            if (condition.toLowerCase().contains("asthma")) {
                suggestions.add("⚠️ Severe asthma - ensure rescue inhaler available");
            }
            if (condition.toLowerCase().contains("anxiety") || condition.toLowerCase().contains("depression")) {
                suggestions.add("✓ Consider anxiety protocols for patient comfort");
            }
            if (condition.toLowerCase().contains("kidney") || condition.toLowerCase().contains("renal")) {
                suggestions.add("⚠️ Renal function compromised - adjust drug dosing");
            }
            if (condition.toLowerCase().contains("heart") || condition.toLowerCase().contains("cardiac") || 
                condition.toLowerCase().contains("coronary")) {
                suggestions.add("⚠️ Cardiac condition present - monitor vital signs closely");
            }
            if (condition.toLowerCase().contains("atrial fibrillation")) {
                suggestions.add("⚠️ A-fib documented - check anticoagulation status");
            }
            if (condition.toLowerCase().contains("anemia")) {
                suggestions.add("✓ Monitor anemia status - may require supplementation");
            }
            if (condition.toLowerCase().contains("migraine")) {
                suggestions.add("⚠️ Migraine history - manage noise and light exposure");
            }
        }
        
        // Medication-based suggestions
        for (String medication : patient.getCurrentMedications()) {
            if (medication.toLowerCase().contains("warfarin")) {
                suggestions.add("⚠️ Anticoagulation therapy - Warfarin in use, high bleeding risk");
            }
            if (medication.toLowerCase().contains("metformin")) {
                suggestions.add("✓ Metformin in use - monitor for lactic acidosis in emergency");
            }
            if (medication.toLowerCase().contains("lisinopril") || medication.toLowerCase().contains("losartan")) {
                suggestions.add("⚠️ ACE inhibitor/ARB in use - monitor blood pressure and potassium");
            }
            if (medication.toLowerCase().contains("albuterol")) {
                suggestions.add("✓ Albuterol available for acute respiratory episodes");
            }
        }
        
        // General safety suggestions
        if (suggestions.isEmpty()) {
            suggestions.add("✓ No critical drug interactions or contraindications identified");
            suggestions.add("✓ Standard emergency protocols may be followed");
        }
        
        return suggestions;
    }
}
