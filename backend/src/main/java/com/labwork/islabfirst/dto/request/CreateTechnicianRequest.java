package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateTechnicianRequest(
        @JsonProperty("name")
        String name,
        @JsonProperty("phone")
        String phone,
        @JsonProperty("specialization")
        String specialization
) {
}
