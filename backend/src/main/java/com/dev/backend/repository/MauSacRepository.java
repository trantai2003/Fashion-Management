package com.dev.backend.repository;

import com.dev.backend.entities.MauSac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

<<<<<<< HEAD
@Repository
public interface MauSacRepository extends JpaRepository<MauSac, Integer>, JpaSpecificationExecutor<MauSac> {
=======
import java.util.Optional;

@Repository
public interface MauSacRepository extends JpaRepository<MauSac, Integer>, JpaSpecificationExecutor<MauSac> {
    Optional<MauSac> findByMaMau(String maMau);
>>>>>>> 233a830ef9af045888f8bb98f7f67dfda98a9879
}