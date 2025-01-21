package com.labwork.islabfirst.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreatePaymentRequest(

        @JsonProperty("amount")
        Long amount


) {
}
