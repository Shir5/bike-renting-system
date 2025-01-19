package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.request.RegisterRequest;
import com.labwork.islabfirst.dto.UserDto;
import com.labwork.islabfirst.mapper.EntityMapper;
import com.labwork.islabfirst.entity.security.User;
import org.mapstruct.Mapper;
@Mapper(componentModel = "spring")
public interface UserMapper extends EntityMapper<UserDto, User> {
    User toEntity(RegisterRequest registerRequest);
}
