package com.labwork.islabfirst.mapper;


import com.labwork.islabfirst.dto.PaymentDto;
import com.labwork.islabfirst.dto.request.CreateBicycleRequest;
import com.labwork.islabfirst.dto.request.CreatePaymentRequest;
import com.labwork.islabfirst.entity.model.Bicycle;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper extends EntityMapper<PaymentDto, Payment>{
    Payment toEntity(CreatePaymentRequest request);

}
