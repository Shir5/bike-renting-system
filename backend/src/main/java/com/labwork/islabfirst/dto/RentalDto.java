package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RentalDto(
        @JsonProperty("id")
        Long id,

        @JsonProperty("user")
        Long user_id,
        @JsonProperty("bicycle")
        Long bicycle_id,
        @JsonProperty("start_station")
        Long start_station_id,

        @JsonProperty("end_station")
        Long end_station_id,

        @JsonProperty("cost")
        Long cost
) {
}
