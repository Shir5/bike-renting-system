package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateBicycleRequest(
        @JsonProperty("model")
        String model,

        @JsonProperty("type")
        String type,

        @JsonProperty("status")
        String status, // Representing the `Color` enum as a string

        @JsonProperty("station")
        Long station_id
) {
}
