package com.labwork.islabfirst.repository;


import com.labwork.islabfirst.entity.model.Bicycle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

@Repository
public interface BicycleRepository extends JpaRepository<Bicycle, Long> {
    Page<Bicycle> findAllByModel(@NonNull String model, @NonNull Pageable pageable);

}
