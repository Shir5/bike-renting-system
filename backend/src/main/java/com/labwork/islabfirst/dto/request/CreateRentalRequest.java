package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateRentalRequest(
        @JsonProperty("user")
        Long user_id,
        @JsonProperty("bicycle")
        Long bicycle_id,
        @JsonProperty("start_station")
        Long start_station_id,

        @JsonProperty("cost")
        Long cost
) {
}
