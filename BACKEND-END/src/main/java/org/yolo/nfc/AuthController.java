package org.yolo.nfc;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.yolo.nfc.Service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // RuntimeExceptions (duplicate email, invalid role) propagate to
        // GlobalExceptionHandler which returns a proper JSON error body.
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        // Previously the catch block swallowed ALL exceptions and returned an empty
        // body (.build()) — the frontend had no way to show a meaningful error.
        // Now only BadCredentialsException is caught and re-thrown as RuntimeException
        // so GlobalExceptionHandler can return a proper JSON 400 body.
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleAuthRequest request) {
        // Let GlobalExceptionHandler handle token verification failures
        return ResponseEntity.ok(authService.googleLogin(request.getCredential()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        AppUser user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getLinkedNfcId(),
                user.getHospital() != null ? user.getHospital().getId() : null,
                user.isEnabled()
        ));
    }
}
