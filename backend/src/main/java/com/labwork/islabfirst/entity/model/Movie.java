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

@Entity
@Table(name = "movie")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Movie extends OwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @NotEmpty
    @Column(name="name", nullable = false)
    private String name; //Поле не может быть null, Строка не может быть пустой

    @NotNull
    @Embedded
    private Coordinates coordinates; //Поле не может быть null

    @NotNull
    @Column(name = "creationDate", updatable = false)
    private java.util.Date creationDate; //Поле не может быть null, Значение этого поля должно генерироваться автоматически

    @NotNull
    @Min(1)
    @Column(name="oscarsCount", nullable = false)
    private int oscarsCount; //Значение поля должно быть больше 0

    @NotNull
    @Min(1)
    @Column(name="budget", nullable = false)
    private Double budget; //Значение поля должно быть больше 0,

    @Min(1)
    @Column(name="totalBoxOffice")
    private long totalBoxOffice; //Значение поля должно быть больше 0

    @Enumerated(EnumType.STRING)
    @Column(name="mpaaRating")
    private MpaaRating mpaaRating; //Поле может быть null



    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "director_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Person director;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screenwriter_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Person screenwriter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT))
    private Person operator;

    @Min(1)
    @Column(name="length")
    private Integer length; //Поле может быть null, Значение поля должно быть больше 0
    @Min(1)
    @Column(name="goldenPalmCount")
    private int goldenPalmCount; //Значение поля должно быть больше 0

    @NotNull
    @Min(1)
    @Column(name = "usaBoxOffice")
    private Integer usaBoxOffice; //Поле не может быть null, Значение поля должно быть больше 0

    @NotNull
    @Column(name = "tagLine")
    private String tagline; //Поле не может быть null
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "genre")
    private MovieGenre genre; //Поле не может быть null

    // Новые поля для отслеживания времени и пользователей
    @Column(name = "createdBy")
    private String createdBy;
    @CreationTimestamp
    @Column(name = "createdAt", updatable = false)
    private LocalDateTime createdAt;


    @Column(name = "updatedBy")
    private String updatedBy;

    @UpdateTimestamp
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;

}
