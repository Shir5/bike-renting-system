package com.labwork.islabfirst.entity.model;


import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Embeddable
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Location {
    @NotNull
    @Column(nullable = false)
    private Double x; //Поле не может быть null

    @Column(nullable = false)
    private long y;

    @Column(nullable = false)
    private double z;
}
