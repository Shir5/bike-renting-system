package com.labwork.islabfirst.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserResponse(@JsonProperty("username")
                          String username,
                           @JsonProperty("balance")
                          Long balance,
                           @JsonProperty("debt")
                          Long debt) {
}
