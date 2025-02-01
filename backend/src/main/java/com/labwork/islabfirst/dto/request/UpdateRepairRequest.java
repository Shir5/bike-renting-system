package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateRepairRequest(
        @JsonProperty("bicycle")
        Long bicycle_id
) {
}
