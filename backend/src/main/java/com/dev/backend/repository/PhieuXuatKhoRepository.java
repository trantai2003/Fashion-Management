package com.dev.backend.repository;

import com.dev.backend.entities.PhieuXuatKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuXuatKhoRepository extends JpaRepository<PhieuXuatKho, Integer>, JpaSpecificationExecutor<PhieuXuatKho> {
    long countBySoPhieuXuatStartingWith(String prefix);
    List<PhieuXuatKho> findByDonBanHangId(Integer donBanHangId);
    boolean existsByDonBanHangIdAndTrangThai(Integer donBanHangId, Integer trangThai);
    Optional<PhieuXuatKho> findBySoPhieuXuat(String soPhieuXuat);
}