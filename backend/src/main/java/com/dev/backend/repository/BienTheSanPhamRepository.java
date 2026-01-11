package com.dev.backend.repository;

import com.dev.backend.entities.BienTheSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BienTheSanPhamRepository extends JpaRepository<BienTheSanPham, Integer>, JpaSpecificationExecutor<BienTheSanPham> {
}