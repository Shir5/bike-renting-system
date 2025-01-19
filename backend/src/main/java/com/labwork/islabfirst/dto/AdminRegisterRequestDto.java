package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.labwork.islabfirst.entity.security.RequestStatus;
import com.labwork.islabfirst.entity.security.User;

import java.time.LocalDateTime;

public record AdminRegisterRequestDto(
        @JsonProperty("request_id")
        Long request_id,

        @JsonProperty("user")
        UserDto user,

        @JsonProperty("description")
        String description,

        @JsonProperty("status")
        RequestStatus status,

        @JsonProperty("created_date")
        LocalDateTime created_date,

        @JsonProperty("updated_date")
        LocalDateTime updated_date
) {
}
