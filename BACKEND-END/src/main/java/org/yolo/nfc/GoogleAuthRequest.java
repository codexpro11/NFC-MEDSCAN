package org.yolo.nfc;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String credential; // The Google ID token from the frontend
}
