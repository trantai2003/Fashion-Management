package com.dev.backend.repository;

import com.dev.backend.entities.DonBanHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DonBanHangRepository extends JpaRepository<DonBanHang, Integer>, JpaSpecificationExecutor<DonBanHang> {
}