package org.yolo.nfc.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.yolo.nfc.AppUser;
import org.yolo.nfc.Repo.AppUserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AppUserRepository appUserRepository;

    /**
     * FIX: A valid BCrypt hash used as a placeholder for Google OAuth users who have
     * no password. Passing "" to BCryptPasswordEncoder.matches() throws
     * IllegalArgumentException("Invalid salt version"), turning a 401 scenario into
     * a 500 crash. This placeholder prevents that.
     *
     * This hash will never match any real password — it was generated from a random
     * UUID. AuthService.login() also rejects Google-only accounts before
     * authentication is attempted (defence-in-depth).
     */
    private static final String GOOGLE_USER_DUMMY_HASH =
            "$2a$10$7EqJtq98hPqEX7fNZaFWoOa9wyTXpRZkrM9pJwTkMjR4dPdHQx2YC";

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String storedPassword = (user.getPasswordHash() != null && !user.getPasswordHash().isBlank())
                ? user.getPasswordHash()
                : GOOGLE_USER_DUMMY_HASH;

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                storedPassword,
                user.isEnabled(),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }
}
