package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TechnicianDto(
        @JsonProperty("id")
        Long id,
        @JsonProperty("name")
        String name,
        @JsonProperty("phone")
        String phone,
        @JsonProperty("specialization")
        String specialization
) {
}
