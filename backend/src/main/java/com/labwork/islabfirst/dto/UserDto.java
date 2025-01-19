package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserDto(@JsonProperty("id")
                      Long id,
                      @JsonProperty("username")
                      String username) {
}
