package com.labwork.islabfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public record PaymentDto(

        @JsonProperty("user")
        Long user_id,

        @JsonProperty("amount")
        Long amount,

        @JsonProperty("paymentDate")
        Date paymentDate
) {
}
