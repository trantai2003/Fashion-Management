package com.dev.backend.repository;

import com.dev.backend.entities.LichSuGiaoDichKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuGiaoDichKhoRepository extends JpaRepository<LichSuGiaoDichKho, Integer>, JpaSpecificationExecutor<LichSuGiaoDichKho> {
    @Query("SELECT k.tenKho FROM LichSuGiaoDichKho ls JOIN ls.kho k " +
            "WHERE ls.idThamChieu = :idPhieuNhap AND ls.loaiThamChieu = 'phieu_nhap_kho' " +
            "AND ls.loaiGiaoDich = 'chuyen_kho' ")
    List<String> findTenKhoNguonByPhieuNhap(Integer idPhieuNhap);
}