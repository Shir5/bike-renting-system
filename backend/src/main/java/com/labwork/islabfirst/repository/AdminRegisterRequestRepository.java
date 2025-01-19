package com.labwork.islabfirst.repository;

import com.labwork.islabfirst.entity.security.AdminRegisterRequest;
import com.labwork.islabfirst.entity.security.RequestStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

public interface AdminRegisterRequestRepository extends JpaRepository<AdminRegisterRequest, Long> {
    // Найти все заявки с определенным статусом
    Page<AdminRegisterRequest> findByStatus(@NonNull RequestStatus status, @NotNull Pageable pageable);

    // Найти заявку по пользователю
    Optional<AdminRegisterRequest> findByUserId(Long userId);

    // Найти заявку по пользователю и статусу
    Optional<AdminRegisterRequest> findByUserIdAndStatus(Long userId, RequestStatus status);


}
