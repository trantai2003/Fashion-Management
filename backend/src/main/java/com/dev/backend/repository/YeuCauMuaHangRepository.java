package com.dev.backend.repository;

import com.dev.backend.entities.YeuCauMuaHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface YeuCauMuaHangRepository extends JpaRepository<YeuCauMuaHang, Integer>, JpaSpecificationExecutor<YeuCauMuaHang> {
}