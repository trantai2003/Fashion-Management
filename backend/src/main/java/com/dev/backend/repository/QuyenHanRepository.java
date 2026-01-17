package com.dev.backend.repository;

import com.dev.backend.entities.QuyenHan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface QuyenHanRepository extends JpaRepository<QuyenHan, Integer>, JpaSpecificationExecutor<QuyenHan> {
}