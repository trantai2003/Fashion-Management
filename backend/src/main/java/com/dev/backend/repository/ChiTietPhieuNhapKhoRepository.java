package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietPhieuNhapKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ChiTietPhieuNhapKhoRepository extends JpaRepository<ChiTietPhieuNhapKho, Integer>, JpaSpecificationExecutor<ChiTietPhieuNhapKho> {
    @Query("""
    SELECT COALESCE(SUM(ct.soLuongNhap), 0)
    FROM ChiTietPhieuNhapKho ct
    WHERE ct.phieuNhapKho.id = :phieuNhapKhoId
      AND ct.bienTheSanPham.id = :bienTheSanPhamId
      AND ct.loHang IS NOT NULL
""")
    BigDecimal sumSoLuongDaKhaiBao(
            @Param("phieuNhapKhoId") Integer phieuNhapKhoId,
            @Param("bienTheSanPhamId") Integer bienTheSanPhamId
    );
    Optional<ChiTietPhieuNhapKho>
    findFirstByPhieuNhapKho_IdAndBienTheSanPham_IdAndLoHangIsNull(
            Integer phieuNhapKhoId,
            Integer bienTheSanPhamId
    );

}