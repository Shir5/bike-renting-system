package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CoordinatesDto(
        @JsonProperty("latitude")
        Long latitude,

        @JsonProperty("longitude")
        Long longitude
) {
}
