package com.labwork.islabfirst.repository;

import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.handler.UniqueConstraintViolationException;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    Page<Person> findAllByName(@NonNull String name, @NonNull Pageable pageable);

    Page<Person> findAllByNameContaining(@NonNull String substring, @NonNull Pageable pageable);

    boolean existsByName(@NotNull @NotEmpty String name);

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT p FROM Person p WHERE p.name = :name")
    Optional<Person> findByNameForUpdate(@Param("name") String name);


    Optional<Person> findByName(String name);
}





