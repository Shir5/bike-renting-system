package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CoordinatesDto(
        @JsonProperty("latitude")
        float latitude,

        @JsonProperty("longitude")
        float longitude
) {
}
