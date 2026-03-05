package org.yolo.nfc;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "insurance")
@Data
public class Insurance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nullable — insurance is optional; the frontend may leave these blank
    private String provider;

    private String policyNumber;

    private String groupNumber;

    private String coverage;

    private LocalDate expiryDate;
}
