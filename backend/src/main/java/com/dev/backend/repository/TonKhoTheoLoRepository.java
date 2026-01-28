package com.dev.backend.repository;

import com.dev.backend.dto.response.customize.LoHangTonKhoDTO;
import com.dev.backend.dto.response.customize.TonKhoChiTietDTO;
import com.dev.backend.dto.response.customize.TonKhoTongHopDTO;
import com.dev.backend.entities.TonKhoTheoLo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TonKhoTheoLoRepository extends JpaRepository<TonKhoTheoLo, Integer>, JpaSpecificationExecutor<TonKhoTheoLo> {
    @Query("""
        select count(t)
        from TonKhoTheoLo t
        join t.loHang l
        join l.bienTheSanPham bt
        join bt.sanPham sp
        where t.soLuongKhaDung <= sp.mucTonToiThieu
    """)
    Long countLowStockWarnings();
    /**
     * Lấy danh sách tồn kho chi tiết theo kho
     * Tổng hợp từ tất cả các lô
     */
    @Query("""
                SELECT new com.dev.backend.dto.response.customize.TonKhoChiTietDTO(
                    bt.id,
                    bt.maSku,
                    sp.tenSanPham,
                    sp.maSanPham,
                    dm.tenDanhMuc,
                    ms.tenMau,
                    ms.maMauHex,
                    s.tenSize,
                    cl.tenChatLieu,
                    k.id,
                    k.tenKho,
                    CAST(
                                COALESCE(SUM(tk.soLuongTon), CAST(0 AS BIGDECIMAL )) AS BIGDECIMAL
                                            ),
                    CAST(
                                COALESCE(SUM(tk.soLuongDaDat), CAST(0 AS BIGDECIMAL )) AS BIGDECIMAL
                                ),
                    bt.giaVon,
                    bt.giaBan,
                    MAX(tk.ngayNhapGanNhat),
                    MAX(tk.ngayXuatGanNhat)
                )
                FROM BienTheSanPham bt
                INNER JOIN bt.sanPham sp
                INNER JOIN sp.danhMuc dm
                INNER JOIN bt.mauSac ms
                INNER JOIN bt.size s
                INNER JOIN bt.chatLieu cl
                INNER JOIN LoHang lh ON lh.bienTheSanPham.id = bt.id
                INNER JOIN TonKhoTheoLo tk ON tk.loHang.id = lh.id
                INNER JOIN tk.kho k
                WHERE k.id = :khoId
                AND bt.trangThai = 1
                GROUP BY bt.id, bt.maSku, sp.tenSanPham, sp.maSanPham, dm.tenDanhMuc,
                         ms.tenMau, ms.maMauHex, s.tenSize, cl.tenChatLieu,
                         k.id, k.tenKho, bt.giaVon, bt.giaBan
                ORDER BY sp.tenSanPham, ms.tenMau, s.thuTuSapXep
            """)
    List<TonKhoChiTietDTO> findTonKhoChiTietByKho(@Param("khoId") Integer khoId);

    /**
     * Lấy danh sách tồn kho với filter
     */
    @Query("""
                SELECT new com.dev.backend.dto.response.customize.TonKhoChiTietDTO(
                    bt.id,
                    bt.maSku,
                    sp.tenSanPham,
                    sp.maSanPham,
                    dm.tenDanhMuc,
                    ms.tenMau,
                    ms.maMauHex,
                    s.tenSize,
                    cl.tenChatLieu,
                    k.id,
                    k.tenKho,
                    CAST(
                                COALESCE(SUM(tk.soLuongTon), CAST(0 AS BIGDECIMAL )) AS BIGDECIMAL
                                            ),
                    CAST(
                                COALESCE(SUM(tk.soLuongDaDat), CAST(0 AS BIGDECIMAL )) AS BIGDECIMAL
                                ),
                    bt.giaVon,
                    bt.giaBan,
                    MAX(tk.ngayNhapGanNhat),
                    MAX(tk.ngayXuatGanNhat)
                )
                FROM BienTheSanPham bt
                INNER JOIN bt.sanPham sp
                INNER JOIN sp.danhMuc dm
                INNER JOIN bt.mauSac ms
                INNER JOIN bt.size s
                INNER JOIN bt.chatLieu cl
                INNER JOIN LoHang lh ON lh.bienTheSanPham.id = bt.id
                INNER JOIN TonKhoTheoLo tk ON tk.loHang.id = lh.id
                INNER JOIN tk.kho k
                WHERE k.id = :khoId
                AND bt.trangThai = 1
                AND (:danhMucId IS NULL OR dm.id = :danhMucId)
                AND (:searchText IS NULL OR 
                     LOWER(sp.tenSanPham) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                     LOWER(bt.maSku) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
                     LOWER(sp.maSanPham) LIKE LOWER(CONCAT('%', :searchText, '%')))
                AND (:coTonKho IS NULL OR 
                     (:coTonKho = true AND SUM(tk.soLuongTon) > 0) OR
                     (:coTonKho = false AND SUM(tk.soLuongTon) = 0))
                GROUP BY bt.id, bt.maSku, sp.tenSanPham, sp.maSanPham, dm.tenDanhMuc,
                         ms.tenMau, ms.maMauHex, s.tenSize, cl.tenChatLieu,
                         k.id, k.tenKho, bt.giaVon, bt.giaBan
                ORDER BY sp.tenSanPham, ms.tenMau, s.thuTuSapXep
            """)
    List<TonKhoChiTietDTO> findTonKhoChiTietByKhoWithFilter(
            @Param("khoId") Integer khoId,
            @Param("danhMucId") Integer danhMucId,
            @Param("searchText") String searchText,
            @Param("coTonKho") Boolean coTonKho
    );

    /**
     * Lấy chi tiết các lô hàng của một biến thể trong kho
     */
    @Query("""
                SELECT new com.dev.backend.dto.response.customize.LoHangTonKhoDTO(
                    lh.id,
                    lh.maLo,
                    lh.ngaySanXuat,
                    ncc.tenNhaCungCap,
                    lh.giaVon,
                    tk.soLuongTon,
                    tk.soLuongDaDat,
                    tk.ngayNhapGanNhat
                )
                FROM LoHang lh
                INNER JOIN TonKhoTheoLo tk ON tk.loHang.id = lh.id
                LEFT JOIN lh.nhaCungCap ncc
                WHERE lh.bienTheSanPham.id = :bienTheId
                AND tk.kho.id = :khoId
                AND tk.soLuongTon > 0
                ORDER BY lh.ngaySanXuat DESC, lh.maLo
            """)
    List<LoHangTonKhoDTO> findLoHangByBienTheAndKho(
            @Param("bienTheId") Integer bienTheId,
            @Param("khoId") Integer khoId
    );

    /**
     * Tổng hợp tồn kho theo sản phẩm gốc
     */
    @Query("""
                SELECT new com.dev.backend.dto.response.customize.TonKhoTongHopDTO(
                    sp.tenSanPham,
                    sp.maSanPham,
                    COUNT(DISTINCT bt.id),
                    CAST(
                                COALESCE(SUM(tk.soLuongTon), 0) AS BIGDECIMAL
                                ),
                    CAST(
                                COALESCE(SUM(tk.soLuongTon * lh.giaVon), 0) AS BIGDECIMAL
                                ),
            
                    COUNT(DISTINCT lh.id)
                )
                FROM SanPhamQuanAo sp
                INNER JOIN BienTheSanPham bt ON bt.sanPham.id = sp.id
                INNER JOIN LoHang lh ON lh.bienTheSanPham.id = bt.id
                INNER JOIN TonKhoTheoLo tk ON tk.loHang.id = lh.id
                WHERE tk.kho.id = :khoId
                AND bt.trangThai = 1
                AND tk.soLuongTon > 0
                GROUP BY sp.id, sp.tenSanPham, sp.maSanPham
                ORDER BY sp.tenSanPham
            """)
    List<TonKhoTongHopDTO> findTonKhoTongHopByKho(@Param("khoId") Integer khoId);

    /**
     * Tồn kho sắp hết (dưới mức tối thiểu)
     */
    @Query("""
                SELECT new com.dev.backend.dto.response.customize.TonKhoChiTietDTO(
                    bt.id,
                    bt.maSku,
                    sp.tenSanPham,
                    sp.maSanPham,
                    dm.tenDanhMuc,
                    ms.tenMau,
                    ms.maMauHex,
                    s.tenSize,
                    cl.tenChatLieu,
                    k.id,
                    k.tenKho,
                    CAST(
                                COALESCE(SUM(tk.soLuongTon), CAST(0 AS BIGDECIMAL )) AS BIGDECIMAL
                                            ),
                    CAST(
                                COALESCE(SUM(tk.soLuongDaDat), CAST(0 AS BIGDECIMAL )) AS BIGDECIMAL
                                ),
                    bt.giaVon,
                    bt.giaBan,
                    MAX(tk.ngayNhapGanNhat),
                    MAX(tk.ngayXuatGanNhat)
                )
                FROM BienTheSanPham bt
                INNER JOIN bt.sanPham sp
                INNER JOIN sp.danhMuc dm
                INNER JOIN bt.mauSac ms
                INNER JOIN bt.size s
                INNER JOIN bt.chatLieu cl
                INNER JOIN LoHang lh ON lh.bienTheSanPham.id = bt.id
                INNER JOIN TonKhoTheoLo tk ON tk.loHang.id = lh.id
                INNER JOIN tk.kho k
                WHERE k.id = :khoId
                AND bt.trangThai = 1
                GROUP BY bt.id, bt.maSku, sp.tenSanPham, sp.maSanPham, dm.tenDanhMuc,
                         ms.tenMau, ms.maMauHex, s.tenSize, cl.tenChatLieu,
                         k.id, k.tenKho, bt.giaVon, bt.giaBan, sp.mucTonToiThieu
                HAVING COALESCE(SUM(tk.soLuongTon), 0) <= sp.mucTonToiThieu
                ORDER BY COALESCE(SUM(tk.soLuongTon), 0)
            """)
    List<TonKhoChiTietDTO> findTonKhoThapByKho(@Param("khoId") Integer khoId);
}