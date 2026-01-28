package com.dev.backend.repository;

import com.dev.backend.entities.LichSuThayDoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LichSuThayDoiRepository extends JpaRepository<LichSuThayDoi, Integer>, JpaSpecificationExecutor<LichSuThayDoi> {
}