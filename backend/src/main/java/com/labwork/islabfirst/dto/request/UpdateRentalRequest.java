package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateRentalRequest(
        @JsonProperty("user")
        Long user_id,
        @JsonProperty("bicycle")
        Long bicycle_id,
        @JsonProperty("end_station")
        Long end_station_id,

        @JsonProperty("cost")
        Long cost
) {
}
