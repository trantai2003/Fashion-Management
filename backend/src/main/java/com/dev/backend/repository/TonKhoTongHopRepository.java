package com.dev.backend.repository;

import com.dev.backend.dto.TonKhoProjection;
import com.dev.backend.entities.BienTheSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TonKhoTongHopRepository extends JpaRepository<BienTheSanPham, Integer> {

    /**
     * Lấy thông tin tồn kho tổng hợp theo từng biến thể sản phẩm và kho.
     *
     * <p>Công thức:
     * <ul>
     *   <li><b>onHand</b>     = SUM(tkl.soLuongTon) — tồn kho thực tế</li>
     *   <li><b>incoming</b>   = SUM(đặt − đã nhận) từ đơn mua hàng trạng thái 1,2,3</li>
     *   <li><b>outgoing</b>   = SUM(đặt − đã giao) từ đơn bán hàng trạng thái 1,2</li>
     *   <li><b>freeToUse</b>  = onHand − outgoing</li>
     *   <li><b>tongGiaTri</b> = SUM(soLuongTon × giaVon của lô)</li>
     * </ul>
     *
     * @param khoId   (tuỳ chọn) lọc theo kho cụ thể; truyền {@code null} để lấy tất cả kho
     * @param keyword (tuỳ chọn) tìm kiếm theo mã SKU hoặc tên sản phẩm; truyền {@code null} để bỏ qua
     * @return danh sách {@link TonKhoProjection}
     */
    @Query("""
            SELECT
                bt.id                                                          AS bienTheId,
                bt.maSku                                                       AS maSku,
                sp.maSanPham                                                   AS maSanPham,
                sp.tenSanPham                                                  AS tenSanPham,
                ms.tenMau                                                      AS tenMau,
                sz.maSize                                                      AS maSize,
                cl.tenChatLieu                                                 AS tenChatLieu,
                sp.mucTonToiThieu                                              AS mucTonToiThieu,
                k.id                                                           AS khoId,
                k.tenKho                                                       AS tenKho,
                COALESCE(SUM(tkl.soLuongTon), 0)                               AS onHand,
                COALESCE(
                    (
                        SELECT SUM(ctdmh.soLuongDat - ctdmh.soLuongDaNhan)
                        FROM ChiTietDonMuaHang ctdmh
                        JOIN ctdmh.donMuaHang dmh
                        WHERE ctdmh.bienTheSanPham.id = bt.id
                          AND dmh.khoNhap.id          = k.id
                          AND dmh.trangThai            IN (4, 5)
                          AND (ctdmh.soLuongDat - ctdmh.soLuongDaNhan) > 0
                    ), 0
                )                                                              AS incoming,
                COALESCE(
                    (
                        SELECT SUM(ctdbh.soLuongDat - ctdbh.soLuongDaGiao)
                        FROM ChiTietDonBanHang ctdbh
                        JOIN ctdbh.donBanHang dbh
                        WHERE ctdbh.bienTheSanPham.id = bt.id
                          AND dbh.khoXuat.id           = k.id
                          AND dbh.trangThai             IN (1, 2)
                          AND (ctdbh.soLuongDat - ctdbh.soLuongDaGiao) > 0
                    ), 0
                )                                                              AS outgoing,
                COALESCE(SUM(tkl.soLuongTon), 0)
                - COALESCE(
                    (
                        SELECT SUM(ctdbh2.soLuongDat - ctdbh2.soLuongDaGiao)
                        FROM ChiTietDonBanHang ctdbh2
                        JOIN ctdbh2.donBanHang dbh2
                        WHERE ctdbh2.bienTheSanPham.id = bt.id
                          AND dbh2.khoXuat.id           = k.id
                          AND dbh2.trangThai             IN (1, 2)
                          AND (ctdbh2.soLuongDat - ctdbh2.soLuongDaGiao) > 0
                    ), 0
                )                                                              AS freeToUse,
                COALESCE(SUM(tkl.soLuongTon * lh.giaVon), 0)                  AS tongGiaTri
            
            FROM BienTheSanPham bt
            JOIN bt.sanPham                  sp
            JOIN bt.mauSac                   ms
            JOIN bt.size                     sz
            JOIN bt.chatLieu                 cl
            JOIN bt.sanPham.danhMuc          dm
            JOIN LoHang                      lh  ON lh.bienTheSanPham.id = bt.id
            JOIN TonKhoTheoLo                tkl ON tkl.loHang.id        = lh.id
            JOIN tkl.kho                     k
            
            WHERE bt.trangThai  = 1
              AND sp.trangThai  = 1
              AND k.trangThai   = 1
              AND (:khoId   IS NULL OR k.id = :khoId)
              AND (:keyword IS NULL
                   OR LOWER(bt.maSku)       LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(sp.tenSanPham)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(sp.maSanPham)   LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            
            GROUP BY
                bt.id,
                bt.maSku,
                sp.maSanPham,
                sp.tenSanPham,
                ms.tenMau,
                sz.maSize,
                cl.tenChatLieu,
                sp.mucTonToiThieu,
                k.id,
                k.tenKho
            
            ORDER BY sp.maSanPham ASC, bt.maSku ASC, k.tenKho ASC
            """)
    List<TonKhoProjection> findTonKhoTongHop(
            @Param("khoId")   Integer khoId,
            @Param("keyword") String  keyword
    );


    /**
     * Overload tiện lợi: lấy tất cả kho, không lọc keyword.
     */
    default List<TonKhoProjection> findTonKhoTongHop() {
        return findTonKhoTongHop(null, null);
    }

    /**
     * Lấy tồn kho của một kho cụ thể.
     */
    default List<TonKhoProjection> findTonKhoByKho(Integer khoId) {
        return findTonKhoTongHop(khoId, null);
    }

    /**
     * Tìm kiếm tồn kho theo từ khoá (SKU / tên sản phẩm) trên tất cả kho.
     */
    default List<TonKhoProjection> searchTonKho(String keyword) {
        return findTonKhoTongHop(null, keyword);
    }

    /**
     * Tìm kiếm tồn kho theo từ khoá trong một kho cụ thể.
     */
    default List<TonKhoProjection> searchTonKhoByKho(Integer khoId, String keyword) {
        return findTonKhoTongHop(khoId, keyword);
    }
}