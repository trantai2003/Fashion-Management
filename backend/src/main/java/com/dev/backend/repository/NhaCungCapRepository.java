package com.dev.backend.repository;

import com.dev.backend.entities.NhaCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, Integer>, JpaSpecificationExecutor<NhaCungCap> {
}