package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.PaymentDto;
import com.labwork.islabfirst.dto.request.CreatePaymentRequest;
import com.labwork.islabfirst.entity.model.Payment;
import java.util.Date;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-01-21T01:55:47+0300",
    comments = "version: 1.6.2, compiler: javac, environment: Java 17.0.13 (Amazon.com Inc.)"
)
@Component
public class PaymentMapperImpl implements PaymentMapper {

    @Override
    public Payment toEntity(PaymentDto dto) {
        if ( dto == null ) {
            return null;
        }

        Payment payment = new Payment();

        payment.setAmount( dto.amount() );
        payment.setPaymentDate( dto.paymentDate() );

        return payment;
    }

    @Override
    public PaymentDto toDto(Payment entity) {
        if ( entity == null ) {
            return null;
        }

        Long amount = null;
        Date paymentDate = null;

        amount = entity.getAmount();
        paymentDate = entity.getPaymentDate();

        Long user_id = null;

        PaymentDto paymentDto = new PaymentDto( user_id, amount, paymentDate );

        return paymentDto;
    }

    @Override
    public Payment toEntity(CreatePaymentRequest request) {
        if ( request == null ) {
            return null;
        }

        Payment payment = new Payment();

        payment.setAmount( request.amount() );

        return payment;
    }
}
