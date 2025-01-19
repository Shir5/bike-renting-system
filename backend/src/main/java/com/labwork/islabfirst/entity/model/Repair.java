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
@Table(name = "repair")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Repair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bicycle_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Bicycle bicycle;


    @NotNull
    @Column(name = "description", nullable = false)
    private String description;


    @Column(name = "repairStartedAt", updatable = false)
    private LocalDateTime repairStartedAt;

    @Column(name = "repairEndedAt", updatable = false)
    private LocalDateTime repairEndedAt; // Новое поле для времени окончания аренды



    @NotNull
    @NotEmpty
    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable = false)
    private RepairStatus status; //Поле не может быть null, Строка не может быть пустой

}
