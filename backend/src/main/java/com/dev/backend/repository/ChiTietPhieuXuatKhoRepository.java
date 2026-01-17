package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietPhieuXuatKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietPhieuXuatKhoRepository extends JpaRepository<ChiTietPhieuXuatKho, Integer>, JpaSpecificationExecutor<ChiTietPhieuXuatKho> {
}