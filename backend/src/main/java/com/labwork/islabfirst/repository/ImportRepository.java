package com.labwork.islabfirst.repository;

import com.labwork.islabfirst.entity.security.Import;
import com.labwork.islabfirst.entity.security.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Range;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportRepository extends JpaRepository<Import, Long> {
    Page<Import> findAllByUserId(Long userId, Pageable pageable);

}
