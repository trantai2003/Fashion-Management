package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietPhieuNhapKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietPhieuNhapKhoRepository extends JpaRepository<ChiTietPhieuNhapKho, Integer>, JpaSpecificationExecutor<ChiTietPhieuNhapKho> {
}