package com.dev.backend.repository;

import com.dev.backend.entities.GoiDangKi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface GoiDangKiRepository extends JpaRepository<GoiDangKi, Integer>, JpaSpecificationExecutor<GoiDangKi> {
}