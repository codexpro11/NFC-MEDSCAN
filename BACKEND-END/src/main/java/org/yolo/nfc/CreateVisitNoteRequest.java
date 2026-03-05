package org.yolo.nfc;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateVisitNoteRequest {
    @NotBlank(message = "Patient NFC ID is required")
    private String nfcId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotBlank(message = "Notes cannot be empty")
    private String notes;

    private String diagnosis;

    // Optional: the actual visit date (defaults to today if not provided)
    private LocalDate visitDate;
}
