package com.labwork.islabfirst.repository;

import com.labwork.islabfirst.entity.model.Bicycle;
import com.labwork.islabfirst.entity.model.Payment;
import com.labwork.islabfirst.entity.model.Station;
import com.labwork.islabfirst.entity.security.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findAllByUser(@NonNull User user, @NonNull Pageable pageable);

}
