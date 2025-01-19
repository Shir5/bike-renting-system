package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.labwork.islabfirst.dto.UserDto;
import com.labwork.islabfirst.dto.CoordinatesDto;
import com.labwork.islabfirst.dto.LocationDto;
import com.labwork.islabfirst.dto.PersonDto;

import java.time.LocalDateTime;
import java.util.Date;

public record CreateMovieRequest (
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
        String genre
){
}



