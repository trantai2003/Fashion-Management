package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietPhieuNhapKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
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
    Optional<ChiTietPhieuNhapKho>
    findByPhieuNhapKho_IdAndBienTheSanPham_IdAndLoHang_MaLo(
            Integer phieuNhapKhoId,
            Integer bienTheSanPhamId,
            String maLo
    );
    Optional<ChiTietPhieuNhapKho> findByIdAndPhieuNhapKho_Id(
            Integer id,
            Integer phieuNhapKhoId
    );

    @Query("""
    select ct
    from ChiTietPhieuNhapKho ct
    where ct.phieuNhapKho.id = :phieuId
      and ct.bienTheSanPham.id = :bienTheId
      and ct.loHang is not null
    order by ct.id asc
""")
    List<ChiTietPhieuNhapKho> findDeclaredLots(
            @Param("phieuId") Integer phieuId,
            @Param("bienTheId") Integer bienTheId
    );

    @Query("""
        select ct
        from ChiTietPhieuNhapKho ct
        where ct.phieuNhapKho.id = :phieuId
          and ct.loHang is not null
    """)
    List<ChiTietPhieuNhapKho> findAllByPhieuNhapKhoIdAndCoLo(Integer phieuId);

    @Query("""
    select count(ctDraft)
    from ChiTietPhieuNhapKho ctDraft
    where ctDraft.phieuNhapKho.id = :phieuId
      and ctDraft.loHang is null
      and (
        select coalesce(sum(ct.soLuongNhap), 0)
        from ChiTietPhieuNhapKho ct
        where ct.phieuNhapKho.id = :phieuId
          and ct.bienTheSanPham.id = ctDraft.bienTheSanPham.id
          and ct.loHang is not null
      ) < ctDraft.soLuongNhap
""")
    long countBienTheChuaDuLo(@Param("phieuId") Integer phieuId);


}