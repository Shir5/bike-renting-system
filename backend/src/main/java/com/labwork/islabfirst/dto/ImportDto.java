package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.labwork.islabfirst.entity.security.ImportType;
import com.labwork.islabfirst.entity.security.OperationStatus;

import java.time.LocalDateTime;

public record ImportDto(
        @JsonProperty(value = "id", required = true)
        Long id,

        @JsonProperty(value = "user_id", required = true)
        Long userId,

        @JsonProperty(value = "status", required = true)
        OperationStatus status,

        @JsonProperty(value = "added_objects", required = true)
        Long objectsAdded,

        @JsonProperty(value = "importCreation", required = true)
        LocalDateTime createdAt,

        @JsonProperty(value = "import_type")
        ImportType importType
) {
}
