package com.dev.backend.repository;

import com.dev.backend.entities.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer>, JpaSpecificationExecutor<NguoiDung> {

    Optional<NguoiDung> findByTenDangNhapOrEmailOrSoDienThoai(String tenDangNhap, String email, String soDienThoai);

    Optional<NguoiDung> findByEmail(String email);
}