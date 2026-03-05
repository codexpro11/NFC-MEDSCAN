package org.yolo.nfc;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "emergency_contacts")
@Data
public class EmergencyContact {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String relation;

    // Alias so both "relation" and "relationship" work in JSON responses (hospital portal uses "relationship")
    @JsonProperty("relationship")
    public String getRelationship() { return relation; }
    
    @Column(nullable = false)
    private String phone;
    
    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonIgnore
    private Patient patient;
}
