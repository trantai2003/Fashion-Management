package com.dev.backend.repository;

import com.dev.backend.entities.LichSuThayDoiQuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LichSuThayDoiQuyenRepository extends JpaRepository<LichSuThayDoiQuyen, Integer>, JpaSpecificationExecutor<LichSuThayDoiQuyen> {
}