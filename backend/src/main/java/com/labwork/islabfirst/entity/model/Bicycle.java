package com.labwork.islabfirst.entity.model;



import com.labwork.islabfirst.entity.security.OwnedEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CollectionId;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "bicycle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bicycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name="model", nullable = false)
    private String model; //Поле не может быть null, Строка не может быть пустой

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name="type", nullable = false)
    private BicycleType type; //Поле не может быть null, Строка не может быть пустой

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable = false)
    private BicycleStatus status; //Поле не может быть null, Строка не может быть пустой


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Station station;


    @CreationTimestamp
    @Column(name = "lastServiceDate", updatable = true)
    private Date lastServiceDate; //Поле не может быть null, Значение этого поля должно генерироваться автоматически


    @Column(name = "mileage")
    private Long mileage;


}
