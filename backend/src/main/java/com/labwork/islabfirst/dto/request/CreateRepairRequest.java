package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateRepairRequest(
        @JsonProperty("bicycle")
        Long bicycle_id,

        @JsonProperty("technician")
        Long technician_id,

        @JsonProperty("description")
        String description
){
}
