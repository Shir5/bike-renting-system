package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LocationDto(
        @JsonProperty("x")
        Double x, // Represents the x coordinate

        @JsonProperty("y")
        Long y,   // Represents the y coordinate

        @JsonProperty("z")
        Double z  // Represents the z coordinate
) {
}
