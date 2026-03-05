package org.yolo.nfc.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.yolo.nfc.AccessLog;
import org.yolo.nfc.AppUser;
import org.yolo.nfc.Patient;
import org.yolo.nfc.Repo.AccessLogRepository;
import org.yolo.nfc.Repo.AppUserRepository;

@Service
@RequiredArgsConstructor
public class AccessLogService {

    private final AccessLogRepository accessLogRepository;
    private final AppUserRepository appUserRepository;

    /**
     * Logs a staff access event for a patient. Fails silently — logging should never
     * break the main request flow.
     */
    public void logAccess(Patient patient, Authentication authentication, AccessLog.Action action) {
        try {
            AppUser staff = appUserRepository.findByEmail(authentication.getName()).orElse(null);
            AccessLog log = new AccessLog();
            log.setPatient(patient);
            log.setAction(action);
            log.setStaff(staff);
            if (staff != null && staff.getHospital() != null) {
                log.setHospital(staff.getHospital());
            }
            accessLogRepository.save(log);
        } catch (Exception ignored) {
            // Access logging should never break the main flow
        }
    }
}
