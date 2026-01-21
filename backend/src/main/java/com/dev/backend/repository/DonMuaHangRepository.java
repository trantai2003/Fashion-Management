package com.dev.backend.repository;

import com.dev.backend.entities.DonMuaHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DonMuaHangRepository extends JpaRepository<DonMuaHang, Integer>, JpaSpecificationExecutor<DonMuaHang> {
    @Query("""
    select count(d)
    from DonMuaHang d
    where d.trangThai = 0
""")
    Long countPendingPurchaseOrders();

}