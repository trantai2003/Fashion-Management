package com.dev.backend.repository;

import com.dev.backend.dto.response.NhatKyNhapXuatDTO;
import com.dev.backend.entities.LichSuGiaoDichKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Báo cáo Nhật ký Nhập - Xuất kho
 *
 * Nguồn dữ liệu chính: lich_su_giao_dich_kho
 *   - so_luong > 0  → nhập kho
 *   - so_luong < 0  → xuất kho
 *
 * Các query trả về NhatKyNhapXuatDTO (interface projection) gồm:
 *   nhanThoiGian, tongNhap, tongXuat, chenhLech,
 *   tongGiaTriNhap, tongGiaTriXuat, soPhieuNhap, soPhieuXuat, sortKey
 */
@Repository
public interface NhatKyNhapXuatRepository extends JpaRepository<LichSuGiaoDichKho, Integer> {

    // --------------------------------------------------
    // 1. THEO NGÀY  (khoảng ngày, group by ngày)
    // --------------------------------------------------
    /**
     * Ví dụ: 01/06 → 30/06 → tối đa 30 điểm
     * Nhãn X: "01/06", "02/06", ...
     */
    @Query(value = """
        SELECT
            ANY_VALUE(DATE_FORMAT(lg.ngay_giao_dich, '%d/%m'))          AS nhanThoiGian,

            -- Số lượng nhập (dương)
            COALESCE(SUM(CASE WHEN lg.so_luong > 0 THEN lg.so_luong  ELSE 0 END), 0)
                                                                         AS tongNhap,
            -- Số lượng xuất (trả về dương để dễ hiển thị)
            COALESCE(SUM(CASE WHEN lg.so_luong < 0 THEN ABS(lg.so_luong) ELSE 0 END), 0)
                                                                         AS tongXuat,
            -- Chênh lệch tồn: nhập - xuất
            COALESCE(SUM(lg.so_luong), 0)                                AS chenhLech,

            -- Giá trị tiền nhập
            COALESCE(SUM(CASE WHEN lg.so_luong > 0
                              THEN lg.so_luong * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriNhap,
            -- Giá trị tiền xuất
            COALESCE(SUM(CASE WHEN lg.so_luong < 0
                              THEN ABS(lg.so_luong) * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriXuat,

            -- Số phiếu nhập (đếm distinct id_tham_chieu khi loai = nhap_kho)
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich = 'nhap_kho'
                                THEN lg.id_tham_chieu END)               AS soPhieuNhap,
            -- Số phiếu xuất (bán hàng + chuyển kho + điều chỉnh giảm)
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich IN ('xuat_kho','chuyen_kho','dieu_chinh')
                                 AND lg.so_luong < 0
                                THEN lg.id_tham_chieu END)               AS soPhieuXuat,

            ANY_VALUE(DAY(lg.ngay_giao_dich))                            AS sortKey

        FROM lich_su_giao_dich_kho lg
        WHERE DATE(lg.ngay_giao_dich) BETWEEN :tuNgay AND :denNgay
          AND (:khoId IS NULL OR lg.kho_id = :khoId)
          AND (:loaiGiaoDich IS NULL OR lg.loai_giao_dich = :loaiGiaoDich)
        GROUP BY
            YEAR(lg.ngay_giao_dich),
            MONTH(lg.ngay_giao_dich),
            DAY(lg.ngay_giao_dich)
        ORDER BY MIN(lg.ngay_giao_dich)
        """, nativeQuery = true)
    List<NhatKyNhapXuatDTO> baoCaoTheoNgay(
            @Param("tuNgay")       LocalDate tuNgay,
            @Param("denNgay")      LocalDate denNgay,
            @Param("khoId")        Integer   khoId,         // null = tất cả kho
            @Param("loaiGiaoDich") String    loaiGiaoDich   // null = tất cả loại
    );


    // --------------------------------------------------
    // 2. THEO TUẦN  (năm, group by tuần ISO)
    // --------------------------------------------------
    @Query(value = """
        SELECT
            CONCAT('Tuần ', ANY_VALUE(WEEK(lg.ngay_giao_dich, 3)))       AS nhanThoiGian,

            COALESCE(SUM(CASE WHEN lg.so_luong > 0 THEN lg.so_luong  ELSE 0 END), 0)
                                                                         AS tongNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0 THEN ABS(lg.so_luong) ELSE 0 END), 0)
                                                                         AS tongXuat,
            COALESCE(SUM(lg.so_luong), 0)                                AS chenhLech,
            COALESCE(SUM(CASE WHEN lg.so_luong > 0
                              THEN lg.so_luong * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0
                              THEN ABS(lg.so_luong) * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriXuat,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich = 'nhap_kho'
                                THEN lg.id_tham_chieu END)               AS soPhieuNhap,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich IN ('xuat_kho','chuyen_kho','dieu_chinh')
                                 AND lg.so_luong < 0
                                THEN lg.id_tham_chieu END)               AS soPhieuXuat,
            WEEK(lg.ngay_giao_dich, 3)                                   AS sortKey

        FROM lich_su_giao_dich_kho lg
        WHERE YEAR(lg.ngay_giao_dich) = :nam
          AND (:khoId IS NULL OR lg.kho_id = :khoId)
          AND (:loaiGiaoDich IS NULL OR lg.loai_giao_dich = :loaiGiaoDich)
        GROUP BY
            YEAR(lg.ngay_giao_dich),
            WEEK(lg.ngay_giao_dich, 3)
        ORDER BY sortKey
        """, nativeQuery = true)
    List<NhatKyNhapXuatDTO> baoCaoTheoTuan(
            @Param("nam")          Integer nam,
            @Param("khoId")        Integer khoId,
            @Param("loaiGiaoDich") String  loaiGiaoDich
    );


    // --------------------------------------------------
    // 3. THEO THÁNG  (năm, group by tháng)
    // --------------------------------------------------
    @Query(value = """
        SELECT
            CONCAT('T', ANY_VALUE(MONTH(lg.ngay_giao_dich)), '/',
                        ANY_VALUE(YEAR(lg.ngay_giao_dich)))              AS nhanThoiGian,

            COALESCE(SUM(CASE WHEN lg.so_luong > 0 THEN lg.so_luong  ELSE 0 END), 0)
                                                                         AS tongNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0 THEN ABS(lg.so_luong) ELSE 0 END), 0)
                                                                         AS tongXuat,
            COALESCE(SUM(lg.so_luong), 0)                                AS chenhLech,
            COALESCE(SUM(CASE WHEN lg.so_luong > 0
                              THEN lg.so_luong * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0
                              THEN ABS(lg.so_luong) * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriXuat,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich = 'nhap_kho'
                                THEN lg.id_tham_chieu END)               AS soPhieuNhap,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich IN ('xuat_kho','chuyen_kho','dieu_chinh')
                                 AND lg.so_luong < 0
                                THEN lg.id_tham_chieu END)               AS soPhieuXuat,
            ANY_VALUE(MONTH(lg.ngay_giao_dich))                          AS sortKey

        FROM lich_su_giao_dich_kho lg
        WHERE YEAR(lg.ngay_giao_dich) = :nam
          AND (:khoId IS NULL OR lg.kho_id = :khoId)
          AND (:loaiGiaoDich IS NULL OR lg.loai_giao_dich = :loaiGiaoDich)
        GROUP BY
            YEAR(lg.ngay_giao_dich),
            MONTH(lg.ngay_giao_dich)
        ORDER BY sortKey
        """, nativeQuery = true)
    List<NhatKyNhapXuatDTO> baoCaoTheoThang(
            @Param("nam")          Integer nam,
            @Param("khoId")        Integer khoId,
            @Param("loaiGiaoDich") String  loaiGiaoDich
    );


    // --------------------------------------------------
    // 4. THEO NĂM  (khoảng năm, group by năm)
    // --------------------------------------------------
    @Query(value = """
        SELECT
            CAST(ANY_VALUE(YEAR(lg.ngay_giao_dich)) AS CHAR)             AS nhanThoiGian,

            COALESCE(SUM(CASE WHEN lg.so_luong > 0 THEN lg.so_luong  ELSE 0 END), 0)
                                                                         AS tongNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0 THEN ABS(lg.so_luong) ELSE 0 END), 0)
                                                                         AS tongXuat,
            COALESCE(SUM(lg.so_luong), 0)                                AS chenhLech,
            COALESCE(SUM(CASE WHEN lg.so_luong > 0
                              THEN lg.so_luong * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0
                              THEN ABS(lg.so_luong) * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriXuat,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich = 'nhap_kho'
                                THEN lg.id_tham_chieu END)               AS soPhieuNhap,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich IN ('xuat_kho','chuyen_kho','dieu_chinh')
                                 AND lg.so_luong < 0
                                THEN lg.id_tham_chieu END)               AS soPhieuXuat,
            ANY_VALUE(YEAR(lg.ngay_giao_dich))                           AS sortKey

        FROM lich_su_giao_dich_kho lg
        WHERE YEAR(lg.ngay_giao_dich) BETWEEN :tuNam AND :denNam
          AND (:khoId IS NULL OR lg.kho_id = :khoId)
          AND (:loaiGiaoDich IS NULL OR lg.loai_giao_dich = :loaiGiaoDich)
        GROUP BY YEAR(lg.ngay_giao_dich)
        ORDER BY sortKey
        """, nativeQuery = true)
    List<NhatKyNhapXuatDTO> baoCaoTheoNam(
            @Param("tuNam")        Integer tuNam,
            @Param("denNam")       Integer denNam,
            @Param("khoId")        Integer khoId,
            @Param("loaiGiaoDich") String  loaiGiaoDich
    );


    // --------------------------------------------------
    // 5. SO SÁNH CÙNG KỲ  (tháng hiện tại vs tháng trước)
    // --------------------------------------------------
    @Query(value = """
        SELECT
            CASE
                WHEN (ANY_VALUE(YEAR(lg.ngay_giao_dich))  = :nam
                  AND ANY_VALUE(MONTH(lg.ngay_giao_dich)) = :thang)
                     THEN CONCAT('T', :thang,      '/', :nam)
                ELSE      CONCAT('T', :thangTruoc, '/', :namTruoc)
            END                                                          AS nhanThoiGian,

            COALESCE(SUM(CASE WHEN lg.so_luong > 0 THEN lg.so_luong  ELSE 0 END), 0)
                                                                         AS tongNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0 THEN ABS(lg.so_luong) ELSE 0 END), 0)
                                                                         AS tongXuat,
            COALESCE(SUM(lg.so_luong), 0)                                AS chenhLech,
            COALESCE(SUM(CASE WHEN lg.so_luong > 0
                              THEN lg.so_luong * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0
                              THEN ABS(lg.so_luong) * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriXuat,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich = 'nhap_kho'
                                THEN lg.id_tham_chieu END)               AS soPhieuNhap,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich IN ('xuat_kho','chuyen_kho','dieu_chinh')
                                 AND lg.so_luong < 0
                                THEN lg.id_tham_chieu END)               AS soPhieuXuat,
            ANY_VALUE(MONTH(lg.ngay_giao_dich))                          AS sortKey

        FROM lich_su_giao_dich_kho lg
        WHERE (
                  (YEAR(lg.ngay_giao_dich)  = :nam      AND MONTH(lg.ngay_giao_dich) = :thang)
               OR (YEAR(lg.ngay_giao_dich)  = :namTruoc AND MONTH(lg.ngay_giao_dich) = :thangTruoc)
              )
          AND (:khoId IS NULL OR lg.kho_id = :khoId)
          AND (:loaiGiaoDich IS NULL OR lg.loai_giao_dich = :loaiGiaoDich)
        GROUP BY
            YEAR(lg.ngay_giao_dich),
            MONTH(lg.ngay_giao_dich)
        ORDER BY sortKey
        """, nativeQuery = true)
    List<NhatKyNhapXuatDTO> soSanhCungKy(
            @Param("nam")          Integer nam,
            @Param("thang")        Integer thang,
            @Param("namTruoc")     Integer namTruoc,
            @Param("thangTruoc")   Integer thangTruoc,
            @Param("khoId")        Integer khoId,
            @Param("loaiGiaoDich") String  loaiGiaoDich
    );


    // --------------------------------------------------
    // 6. CHI TIẾT TỪNG GIAO DỊCH  (dạng bảng phân trang)
    // --------------------------------------------------
    /**
     * Trả về từng dòng giao dịch thực tế (không group),
     * dùng để hiển thị bảng nhật ký chi tiết.
     * Kết hợp với Pageable từ Spring Data nếu cần phân trang.
     */
    @Query(value = """
        SELECT
            DATE_FORMAT(lg.ngay_giao_dich, '%d/%m/%Y %H:%i')            AS nhanThoiGian,
            lg.so_luong                                                  AS tongNhap,
            0                                                            AS tongXuat,
            lg.so_luong                                                  AS chenhLech,
            CASE WHEN lg.so_luong > 0 THEN lg.so_luong * lg.gia_von
                 ELSE 0 END                                              AS tongGiaTriNhap,
            CASE WHEN lg.so_luong < 0 THEN ABS(lg.so_luong) * lg.gia_von
                 ELSE 0 END                                              AS tongGiaTriXuat,
            CASE WHEN lg.loai_giao_dich = 'nhap_kho'  THEN 1 ELSE 0 END AS soPhieuNhap,
            CASE WHEN lg.loai_giao_dich != 'nhap_kho' THEN 1 ELSE 0 END AS soPhieuXuat,
            lg.id                                                        AS sortKey
        FROM lich_su_giao_dich_kho lg
        WHERE DATE(lg.ngay_giao_dich) BETWEEN :tuNgay AND :denNgay
          AND (:khoId IS NULL OR lg.kho_id = :khoId)
          AND (:loaiGiaoDich IS NULL OR lg.loai_giao_dich = :loaiGiaoDich)
          AND (:bienTheSanPhamId IS NULL OR lg.bien_the_san_pham_id = :bienTheSanPhamId)
        ORDER BY lg.ngay_giao_dich DESC
        """, nativeQuery = true)
    List<NhatKyNhapXuatDTO> chiTietGiaoDich(
            @Param("tuNgay")             LocalDate tuNgay,
            @Param("denNgay")            LocalDate denNgay,
            @Param("khoId")              Integer   khoId,
            @Param("loaiGiaoDich")       String    loaiGiaoDich,
            @Param("bienTheSanPhamId")   Integer   bienTheSanPhamId   // null = tất cả SKU
    );


    // --------------------------------------------------
    // 7. TỔNG HỢP THEO KHO  (so sánh các kho trong 1 kỳ)
    // --------------------------------------------------
    /**
     * Mỗi dòng = 1 kho, dùng để vẽ stacked bar hoặc bảng so sánh kho.
     */
    @Query(value = """
        SELECT
            ANY_VALUE(k.ten_kho)                                         AS nhanThoiGian,

            COALESCE(SUM(CASE WHEN lg.so_luong > 0 THEN lg.so_luong  ELSE 0 END), 0)
                                                                         AS tongNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0 THEN ABS(lg.so_luong) ELSE 0 END), 0)
                                                                         AS tongXuat,
            COALESCE(SUM(lg.so_luong), 0)                                AS chenhLech,
            COALESCE(SUM(CASE WHEN lg.so_luong > 0
                              THEN lg.so_luong * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriNhap,
            COALESCE(SUM(CASE WHEN lg.so_luong < 0
                              THEN ABS(lg.so_luong) * lg.gia_von ELSE 0 END), 0)
                                                                         AS tongGiaTriXuat,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich = 'nhap_kho'
                                THEN lg.id_tham_chieu END)               AS soPhieuNhap,
            COUNT(DISTINCT CASE WHEN lg.loai_giao_dich IN ('xuat_kho','chuyen_kho','dieu_chinh')
                                 AND lg.so_luong < 0
                                THEN lg.id_tham_chieu END)               AS soPhieuXuat,
            lg.kho_id                                                    AS sortKey

        FROM lich_su_giao_dich_kho lg
        JOIN kho k ON k.id = lg.kho_id
        WHERE DATE(lg.ngay_giao_dich) BETWEEN :tuNgay AND :denNgay
          AND (:loaiGiaoDich IS NULL OR lg.loai_giao_dich = :loaiGiaoDich)
        GROUP BY lg.kho_id
        ORDER BY sortKey
        """, nativeQuery = true)
    List<NhatKyNhapXuatDTO> tongHopTheoKho(
            @Param("tuNgay")       LocalDate tuNgay,
            @Param("denNgay")      LocalDate denNgay,
            @Param("loaiGiaoDich") String    loaiGiaoDich
    );
}