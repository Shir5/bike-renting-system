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
@Table(name = "rental")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bicycle_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Bicycle bicycle;



    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "start_station_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Station start_station;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "end_station_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Station end_station;


    @CreationTimestamp
    @Column(name = "rentalStartedAt", updatable = false)
    private LocalDateTime rentalStartedAt;

    @UpdateTimestamp
    @Column(name = "rentalEndedAt")
    private LocalDateTime rentalEndedAt; // Новое поле для времени окончания аренды



    @Column(name = "cost", updatable = true)
    private Double cost; // Новое поле для времени окончания аренды





}
