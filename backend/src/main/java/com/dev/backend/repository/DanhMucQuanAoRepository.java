package com.dev.backend.repository;

import com.dev.backend.entities.DanhMucQuanAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhMucQuanAoRepository extends JpaRepository<DanhMucQuanAo, Integer>, JpaSpecificationExecutor<DanhMucQuanAo> {

    @Query("SELECT dm FROM DanhMucQuanAo dm WHERE dm.danhMucCha IS NULL AND dm.trangThai = :trangThai")
    List<DanhMucQuanAo> findAllDanhMucChaByTrangThai(@Param("trangThai") Integer trangThai);

    Optional<DanhMucQuanAo> findByMaDanhMuc(String maDanhMuc);
}