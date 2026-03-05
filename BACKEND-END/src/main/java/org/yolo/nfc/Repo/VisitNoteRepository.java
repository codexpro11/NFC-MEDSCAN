package org.yolo.nfc.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yolo.nfc.VisitNote;

import java.util.List;

@Repository
public interface VisitNoteRepository extends JpaRepository<VisitNote, Long> {
    List<VisitNote> findByPatient_NfcIdOrderByVisitDateDesc(String nfcId);

    List<VisitNote> findByHospital_Id(Long hospitalId);
}
