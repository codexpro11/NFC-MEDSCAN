package org.yolo.nfc;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nfcId;

    private LocalDate dateOfBirth;

    private String photoUrl;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean dataConsentEnabled = true;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean emergencyOverride = true;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private String bloodGroup;

    @ElementCollection
    @CollectionTable(name = "patient_allergies", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "allergy")
    private List<String> allergies;

    @ElementCollection
    @CollectionTable(name = "patient_conditions", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "conditions")
    private List<String> medicalConditions;

    @ElementCollection
    @CollectionTable(name = "patient_medications", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "medication")
    private List<String> currentMedications;

    private LocalDate lastCheckup;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "insurance_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Insurance insurance;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "patient")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<EmergencyContact> emergencyContacts;
}
