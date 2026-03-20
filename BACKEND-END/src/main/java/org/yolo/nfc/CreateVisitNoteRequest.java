package org.yolo.nfc;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateVisitNoteRequest {
    @NotBlank(message = "Patient NFC ID is required")
    private String nfcId;

    // Optional: if not provided, the backend uses the doctor's own hospital
    private Long hospitalId;

    @NotBlank(message = "Notes cannot be empty")
    private String notes;

    private String diagnosis;

    // Optional: the actual visit date (defaults to today if not provided)
    private LocalDate visitDate;
}
