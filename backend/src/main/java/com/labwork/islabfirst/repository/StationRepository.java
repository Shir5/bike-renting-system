package com.labwork.islabfirst.repository;

import com.labwork.islabfirst.entity.model.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    Page<Station> findAllByAddress(@NonNull String address, @NonNull Pageable pageable);

}
