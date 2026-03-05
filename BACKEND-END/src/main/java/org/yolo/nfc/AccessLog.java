package org.yolo.nfc;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "access_logs")
@Data
public class AccessLog {

    public enum Action {
        NFC_SCAN, MANUAL_SEARCH, PROFILE_VIEW, NOTES_VIEW
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private AppUser staff;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Action action;

    @CreationTimestamp
    private LocalDateTime accessedAt;
}
