package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Date;

public record BicycleDto(
        @JsonProperty("id")
        Long id,

        @JsonProperty("model")
        String model,

        @JsonProperty("type")
        String type, // Representing the `Color` enum as a string

        @JsonProperty("status")
        String status, // Representing the `Color` enum as a string

        @JsonProperty("station")
        Long station_id, // Nested DTO for the `Location` field

        @JsonProperty("lastServiceDate")
        Date lastServiceDate
) {
}
