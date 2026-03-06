package org.yolo.nfc.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.yolo.nfc.*;
import org.yolo.nfc.Repo.AppUserRepository;
import org.yolo.nfc.Repo.HospitalRepository;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Value("${google.client-id:NOT_SET}")
    private String googleClientId;

    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // FIX: Validate role before calling valueOf() — an invalid role previously
        // caused an uncaught IllegalArgumentException (raw 500 error).
        AppUser.Role role;
        try {
            role = AppUser.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: '" + request.getRole() +
                    "'. Must be one of: PATIENT, DOCTOR, NURSE, RECEPTIONIST, ADMIN");
        }
        user.setRole(role);
        user.setLinkedNfcId(request.getLinkedNfcId());
        user.setAuthProvider(AppUser.AuthProvider.LOCAL);

        if (request.getHospitalId() != null) {
            Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new RuntimeException("Hospital not found"));
            user.setHospital(hospital);
        }

        AppUser saved = appUserRepository.save(user);
        String token = jwtUtil.generateToken(saved);

        return new AuthResponse(
                token,
                saved.getEmail(),
                saved.getName(),
                saved.getRole().name(),
                saved.getHospital() != null ? saved.getHospital().getId() : null);
    }

    public AuthResponse login(AuthRequest request) {
        // FIX: Pre-fetch user to check authProvider BEFORE hitting BCrypt.
        // Previously, Google-only users (passwordHash = null) caused BCrypt to crash
        // with "Invalid salt version" (500 error) instead of a clean 401.
        AppUser user = appUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getAuthProvider() == AppUser.AuthProvider.GOOGLE) {
            throw new RuntimeException(
                    "This account was created with Google Sign-In. " +
                    "Please use the 'Sign in with Google' button.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = jwtUtil.generateToken(user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getHospital() != null ? user.getHospital().getId() : null);
    }

    /**
     * Verify Google ID token and create/find user, returning a JWT.
     */
    public AuthResponse googleLogin(String idTokenString) {
        GoogleIdToken.Payload payload = verifyGoogleToken(idTokenString);

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String googleId = payload.getSubject();

        AppUser user = appUserRepository.findByEmail(email).orElseGet(() -> {
            AppUser newUser = new AppUser();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : email.split("@")[0]);
            newUser.setRole(AppUser.Role.PATIENT);
            newUser.setAuthProvider(AppUser.AuthProvider.GOOGLE);
            newUser.setGoogleId(googleId);
            newUser.setPasswordHash(null);
            return appUserRepository.save(newUser);
        });

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            user.setAuthProvider(AppUser.AuthProvider.GOOGLE);
            appUserRepository.save(user);
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(
                token,
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getHospital() != null ? user.getHospital().getId() : null);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID token");
            }
            return idToken.getPayload();
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage(), e);
        }
    }

    public AppUser getCurrentUser(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
