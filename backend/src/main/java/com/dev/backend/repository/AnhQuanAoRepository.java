package com.dev.backend.repository;

import com.dev.backend.entities.AnhQuanAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AnhQuanAoRepository extends JpaRepository<AnhQuanAo, Integer>, JpaSpecificationExecutor<AnhQuanAo> {
}