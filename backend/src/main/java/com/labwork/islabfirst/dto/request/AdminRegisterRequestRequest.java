package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AdminRegisterRequestRequest(
        @JsonProperty(value = "username", required = true)
        String username,
        @JsonProperty(value = "description", required = true)
        String description
) {
}
