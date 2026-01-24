package com.dev.backend.repository;

import com.dev.backend.entities.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

<<<<<<< HEAD
@Repository
public interface SizeRepository extends JpaRepository<Size, Integer>, JpaSpecificationExecutor<Size> {
=======
import java.util.Optional;

@Repository
public interface SizeRepository extends JpaRepository<Size, Integer>, JpaSpecificationExecutor<Size> {
    Optional<Size> findByMaSize(String maSize);
>>>>>>> 233a830ef9af045888f8bb98f7f67dfda98a9879
}