package com.dev.backend.repository;

import com.dev.backend.entities.AnhBienThe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AnhBienTheRepository extends JpaRepository<AnhBienThe, Integer>, JpaSpecificationExecutor<AnhBienThe> {
}