package com.dev.backend.repository;

import com.dev.backend.entities.DonBanHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface DonBanHangRepository
        extends JpaRepository<DonBanHang, Integer>,
        JpaSpecificationExecutor<DonBanHang> {

    @Query("""
        select function('date', d.ngayDatHang), sum(d.tongCong)
        from DonBanHang d
        where d.ngayDatHang >= :fromDate
        group by function('date', d.ngayDatHang)
        order by function('date', d.ngayDatHang)
    """)
    List<Object[]> revenueFromDate(@Param("fromDate") Instant fromDate);

    @Query("""
        select count(d)
        from DonBanHang d
        where function('date', d.ngayDatHang) = current_date
    """)
    Long countOrdersToday();

    @Query("""
        select coalesce(sum(d.tongCong), 0)
        from DonBanHang d
        where function('date', d.ngayDatHang) = current_date
    """)
    Long sumRevenueToday();
    @Query("""
    select count(d)
    from DonBanHang d
    where d.trangThai = 0
""")
    Long countPendingSaleOrders();

}
