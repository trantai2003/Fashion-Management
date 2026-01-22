package com.dev.backend.repository;

import com.dev.backend.entities.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer>, JpaSpecificationExecutor<NguoiDung> {

    Optional<NguoiDung> findByTenDangNhapOrEmailOrSoDienThoai(String tenDangNhap, String email, String soDienThoai);

    Optional<NguoiDung> findByEmail(String email);

    boolean existsByTenDangNhap(String tenDangNhap);
    boolean existsByEmail(String email);
    boolean existsBySoDienThoai(String soDienThoai);

    @Query("""
        select count(u)
        from NguoiDung u
        where function('date', u.ngayTao) = current_date
    """)
    Long countNewUsersToday();

    @Query("""
        select count(u)
        from NguoiDung u
        where u.trangThai = 0
    """)
    Long countBannedUsers();
}
