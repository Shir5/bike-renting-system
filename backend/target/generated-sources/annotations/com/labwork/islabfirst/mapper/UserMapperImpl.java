package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.UserDto;
import com.labwork.islabfirst.dto.request.RegisterRequest;
import com.labwork.islabfirst.entity.security.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-01-21T16:23:19+0300",
    comments = "version: 1.6.2, compiler: javac, environment: Java 17.0.13 (Amazon.com Inc.)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(UserDto dto) {
        if ( dto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( dto.id() );
        user.username( dto.username() );
        user.balance( dto.balance() );
        user.debt( dto.debt() );

        return user.build();
    }

    @Override
    public UserDto toDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String username = null;
        Long balance = null;
        Long debt = null;

        id = entity.getId();
        username = entity.getUsername();
        balance = entity.getBalance();
        debt = entity.getDebt();

        UserDto userDto = new UserDto( id, username, balance, debt );

        return userDto;
    }

    @Override
    public User toEntity(RegisterRequest registerRequest) {
        if ( registerRequest == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.username( registerRequest.username() );
        user.password( registerRequest.password() );

        return user.build();
    }
}
