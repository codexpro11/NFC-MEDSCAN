package org.yolo.nfc.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yolo.nfc.AccessLog;

import java.util.List;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {
    List<AccessLog> findByPatient_NfcIdOrderByAccessedAtDesc(String nfcId);

    List<AccessLog> findByHospital_Id(Long hospitalId);
}
