package com.dev.backend.repository;

import com.dev.backend.entities.LichSuGiaoDichKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LichSuGiaoDichKhoRepository extends JpaRepository<LichSuGiaoDichKho, Integer>, JpaSpecificationExecutor<LichSuGiaoDichKho> {
}