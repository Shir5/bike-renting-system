package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CoordinatesDto(
        @JsonProperty("x")
        Long x,

        @JsonProperty("y")
        Long y
) {
}
