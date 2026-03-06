package com.dev.backend.repository;

import com.dev.backend.dto.response.customize.PickedLotDto;
import com.dev.backend.entities.ChiTietPhieuXuatKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ChiTietPhieuXuatKhoRepository extends JpaRepository<ChiTietPhieuXuatKho, Integer>, JpaSpecificationExecutor<ChiTietPhieuXuatKho> {
    List<ChiTietPhieuXuatKho> findByPhieuXuatKhoIdAndLoHangIsNull(Integer phieuXuatKhoId);
    List<ChiTietPhieuXuatKho> findByPhieuXuatKhoIdAndBienTheSanPhamIdAndLoHangIsNotNull(
            Integer phieuXuatKhoId,
            Integer bienTheSanPhamId
    );
    @Query("""
        select coalesce(sum(ct.soLuongXuat), 0)
        from ChiTietPhieuXuatKho ct
        where ct.phieuXuatKho.id = :phieuId
          and ct.bienTheSanPham.id = :bienTheId
          and ct.loHang is not null
    """)
    BigDecimal sumSoLuongDaPick(
            @Param("phieuId") Integer phieuId,
            @Param("bienTheId") Integer bienTheId
    );
    @Query("""
        select new com.dev.backend.dto.response.customize.PickedLotDto(
            ct.loHang.id,
            sum(ct.soLuongXuat)
        )
        from ChiTietPhieuXuatKho ct
        where ct.phieuXuatKho.id = :phieuXuatKhoId
          and ct.bienTheSanPham.id = :bienTheSanPhamId
          and ct.loHang is not null
        group by ct.loHang.id
    """)
    List<PickedLotDto> findPickedLots(
            Integer phieuXuatKhoId,
            Integer bienTheSanPhamId
    );
    @Modifying
    @Query("""
        delete from ChiTietPhieuXuatKho ct
        where ct.phieuXuatKho.id = :phieuXuatKhoId
          and ct.bienTheSanPham.id = :bienTheSanPhamId
          and ct.loHang is not null
    """)
    void deletePickedByPhieuAndBienThe(
            @Param("phieuXuatKhoId") Integer phieuXuatKhoId,
            @Param("bienTheSanPhamId") Integer bienTheSanPhamId
    );
}