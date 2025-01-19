package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.labwork.islabfirst.dto.UserDto;

import java.time.LocalDateTime;


public record PersonDto(
        @JsonProperty("id")
        Long id,

        @JsonProperty("name")
        String name,

        @JsonProperty("eye_color")
        String eyeColor, // Representing the `Color` enum as a string

        @JsonProperty("hair_color")
        String hairColor, // Representing the `Color` enum as a string

        @JsonProperty("location")
        LocationDto location, // Nested DTO for the `Location` field

        @JsonProperty("birthday")
        LocalDateTime birthday,

        @JsonProperty("nationality")
        String nationality, // Representing the `Country` enum as a string

        @JsonProperty("owner")
        UserDto owner
) {
}
