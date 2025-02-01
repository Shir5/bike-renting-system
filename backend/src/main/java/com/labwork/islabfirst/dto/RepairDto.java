package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RepairDto(
        @JsonProperty("id")
        Long id,
        @JsonProperty("bicycle")
        Long bicycle_id,
        @JsonProperty("technician")
        Long technician_id,
        @JsonProperty("description")
        String description,
        @JsonProperty("status")
        String status
) {
}
