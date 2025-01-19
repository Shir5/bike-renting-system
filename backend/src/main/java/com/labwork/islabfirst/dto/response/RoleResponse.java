package com.labwork.islabfirst.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.labwork.islabfirst.entity.security.Role;

public record RoleResponse(
        @JsonProperty("username")
        String username,
        @JsonProperty("role")
        String role
) {
}
