package com.labwork.islabfirst.entity.model;



import com.labwork.islabfirst.entity.security.OwnedEntity;
import com.labwork.islabfirst.entity.security.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.checkerframework.checker.units.qual.C;
import org.hibernate.annotations.CollectionId;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "report")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bicycle_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Bicycle bicycle;

    @Column(name = "reportDate", updatable = false)
    private LocalDateTime reportDate;


    @NotNull
    @Column(name="description", nullable = false)
    private String description;



}
