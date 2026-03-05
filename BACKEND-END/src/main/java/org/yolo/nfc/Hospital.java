package org.yolo.nfc;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospitals")
@Data
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String city;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @JsonIgnore // API key is sensitive — never expose it in responses
    @Column(nullable = false, unique = true)
    private String apiKey = UUID.randomUUID().toString();

    @CreationTimestamp
    private LocalDateTime createdAt;
}
