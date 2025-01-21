package com.labwork.islabfirst.entity.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Embeddable
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Coordinates {
    @NotNull
    @Column(nullable = false)
    private float latitude;

    @NotNull
    @Column(nullable = false)
    private float longitude;
}
