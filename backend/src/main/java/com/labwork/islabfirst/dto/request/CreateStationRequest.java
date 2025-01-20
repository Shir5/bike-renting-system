package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.labwork.islabfirst.dto.CoordinatesDto;
import com.labwork.islabfirst.entity.model.Coordinates;

public record CreateStationRequest(
        @JsonProperty("name")
        String name,

        @JsonProperty("coordinates")
        CoordinatesDto coordinates
) {
}
