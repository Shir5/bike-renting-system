package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StationDto(
        @JsonProperty("id")
        Long id,

        @JsonProperty("address")
        String address,

        @JsonProperty("coordinates")
        CoordinatesDto coordinates,

        @JsonProperty("totalSlots")
        Long totalSlots,

        @JsonProperty("availableBicycles")
        Long availableBicycles
) {
}
