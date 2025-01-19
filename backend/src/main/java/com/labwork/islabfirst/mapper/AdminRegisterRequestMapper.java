package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.AdminRegisterRequestDto;
import com.labwork.islabfirst.dto.request.RegisterRequest;
import com.labwork.islabfirst.dto.request.AdminRegisterRequestRequest;
import com.labwork.islabfirst.mapper.EntityMapper;
import com.labwork.islabfirst.entity.security.AdminRegisterRequest;
import com.labwork.islabfirst.entity.security.User;
import org.mapstruct.Mapper;

public interface AdminRegisterRequestMapper extends EntityMapper<AdminRegisterRequestDto, AdminRegisterRequest> {
    AdminRegisterRequest toEntity(AdminRegisterRequestRequest registerRequest);

}
