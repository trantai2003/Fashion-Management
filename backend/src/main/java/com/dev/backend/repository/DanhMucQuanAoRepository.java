package com.dev.backend.repository;

import com.dev.backend.entities.DanhMucQuanAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DanhMucQuanAoRepository extends JpaRepository<DanhMucQuanAo, Integer>, JpaSpecificationExecutor<DanhMucQuanAo> {
}