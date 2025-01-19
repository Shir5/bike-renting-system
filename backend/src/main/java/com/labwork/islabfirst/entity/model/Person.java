package com.labwork.islabfirst.entity.model;



import com.fasterxml.jackson.annotation.JsonProperty;
import com.labwork.islabfirst.entity.security.OwnedEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "person")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Person extends OwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotNull
    @NotEmpty
    @Column(name="name", nullable = false)
    private String name; //Поле не может быть null, Строка не может быть пустой

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name="eyeColor")
    private Color eyeColor; //Поле не может быть null

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name="hairColor")
    private Color hairColor; //Поле не может быть null

    @Embedded
    private Location location; //Поле может быть null

    @Column(name="birthday")
    private java.time.LocalDateTime birthday; //Поле может быть null

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name="nationality")
    private Country nationality; //Поле не может быть null


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
