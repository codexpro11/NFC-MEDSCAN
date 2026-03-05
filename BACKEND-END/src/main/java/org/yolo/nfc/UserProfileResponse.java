package org.yolo.nfc;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Safe user profile response — only exposes fields the frontend needs.
 * Never exposes passwordHash, googleId, or internal auth fields.
 */
@Data
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String linkedNfcId;
    private Long hospitalId;
    private boolean enabled;
}
