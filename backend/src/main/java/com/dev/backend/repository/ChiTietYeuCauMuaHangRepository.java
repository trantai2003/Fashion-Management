package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietYeuCauMuaHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ChiTietYeuCauMuaHangRepository extends JpaRepository<ChiTietYeuCauMuaHang, Integer>, JpaSpecificationExecutor<ChiTietYeuCauMuaHang> {
}