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
@Table(name = "bicycle_coordinates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BicycleCoordinates {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bicycle_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Bicycle bicycle;

    @NotNull
    @Embedded
    private Coordinates coordinates; //Поле не может быть null

    @NotNull
    @Column(name = "updatedAt", nullable = false)
    private LocalDateTime updatedAt;
}
