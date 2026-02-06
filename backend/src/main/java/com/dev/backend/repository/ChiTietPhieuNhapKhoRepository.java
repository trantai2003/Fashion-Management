package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietPhieuNhapKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;

@Repository
public interface ChiTietPhieuNhapKhoRepository extends JpaRepository<ChiTietPhieuNhapKho, Integer>, JpaSpecificationExecutor<ChiTietPhieuNhapKho> {
    @Query("""
        select coalesce(sum(c.soLuongNhap), 0)
        from ChiTietPhieuNhapKho c
        where c.phieuNhapKho.id = :phieuNhapKhoId
          and c.bienTheSanPham.id = :bienTheSanPhamId
    """)
    BigDecimal sumSoLuongDaNhap(
            @Param("phieuNhapKhoId") Integer phieuNhapKhoId,
            @Param("bienTheSanPhamId") Integer bienTheSanPhamId
    );
}