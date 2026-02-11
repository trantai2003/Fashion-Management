package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietDonBanHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietDonBanHangRepository extends JpaRepository<ChiTietDonBanHang, Integer>, JpaSpecificationExecutor<ChiTietDonBanHang> {
    List<ChiTietDonBanHang> findByDonBanHangId(Integer donBanHangId);
}