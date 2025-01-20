package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreatePaymentRequest(

        @JsonProperty("user")
        Long user_id,

        @JsonProperty("amount")
        Long amount


) {
}
