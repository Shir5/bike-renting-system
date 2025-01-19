package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.labwork.islabfirst.dto.UserDto;

import java.util.Date;

public record MovieDto(
        @JsonProperty("id")
        Long id,

        @JsonProperty("name")
        String name,

        @JsonProperty("coordinates")
        CoordinatesDto coordinates,

        @JsonProperty("creation_date")
        Date creationDate,

        @JsonProperty("oscars_count")
        int oscarsCount,

        @JsonProperty("budget")
        Double budget,

        @JsonProperty("total_box_office")
        Long totalBoxOffice,

        @JsonProperty("mpaa_rating")
        String mpaaRating,

        @JsonProperty("director")
        Long directorID,

        @JsonProperty("screenwriter")
        Long screenwriterID,

        @JsonProperty("operator")
        Long operatorID,

        @JsonProperty("length")
        Integer length,

        @JsonProperty("golden_palm_count")
        int goldenPalmCount,

        @JsonProperty("usa_box_office")
        Integer usaBoxOffice,

        @JsonProperty("tagline")
        String tagline,

        @JsonProperty("genre")
        String genre,
        @JsonProperty("owner")
        UserDto owner
) {
}
