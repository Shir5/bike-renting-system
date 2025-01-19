package com.labwork.islabfirst.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record JwtResponse(
        @JsonProperty("access_token")
        String access_token) {
}
