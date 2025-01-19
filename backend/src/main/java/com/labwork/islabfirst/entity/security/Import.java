package com.labwork.islabfirst.entity.security;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "imports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Import {
    @Id
    @GeneratedValue
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", updatable = false)
    private OperationStatus status;

    @NotNull
    @Column(name = "user_id", updatable = false)
    private Long userId;

    @NotNull
    @Column(name = "addedObjects", updatable = false)
    private Long addedObjects;

    @CreationTimestamp
    @Column(name = "importCreation", updatable = false)
    private LocalDateTime createdAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "importType")
    private ImportType importType;
}
