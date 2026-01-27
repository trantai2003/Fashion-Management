package com.dev.backend.repository;

import com.dev.backend.entities.TonKhoTheoLo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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
}