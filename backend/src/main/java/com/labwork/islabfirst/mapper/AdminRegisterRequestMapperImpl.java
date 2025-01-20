package com.labwork.islabfirst.mapper;


import com.labwork.islabfirst.dto.AdminRegisterRequestDto;
import com.labwork.islabfirst.dto.UserDto;
import com.labwork.islabfirst.dto.request.AdminRegisterRequestRequest;
import com.labwork.islabfirst.entity.security.AdminRegisterRequest;
import com.labwork.islabfirst.entity.security.RequestStatus;
import com.labwork.islabfirst.entity.security.User;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;


@Component
public class AdminRegisterRequestMapperImpl implements AdminRegisterRequestMapper {

    @Override
    public AdminRegisterRequest toEntity(AdminRegisterRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        AdminRegisterRequest.AdminRegisterRequestBuilder adminRegisterRequest = AdminRegisterRequest.builder();
        adminRegisterRequest.id(dto.request_id());
        adminRegisterRequest.user(userDtoToUser(dto.user()));
        adminRegisterRequest.description( dto.description() );
        adminRegisterRequest.status( dto.status() );

        return adminRegisterRequest.build();
    }

    @Override
    public AdminRegisterRequestDto toDto(AdminRegisterRequest entity) {
        if ( entity == null ) {
            return null;
        }

        Long request_id = null;
        UserDto user = null;
        String description = null;
        RequestStatus status = null;

        request_id = entity.getId();
        user = userToUserDto(entity.getUser());
        description = entity.getDescription();
        status = entity.getStatus();

        LocalDateTime created_date = entity.getCreatedDate();
        LocalDateTime updated_date = entity.getUpdatedDate();

        AdminRegisterRequestDto adminRegisterRequestDto = new AdminRegisterRequestDto( request_id,user, description, status, created_date, updated_date );

        return adminRegisterRequestDto;
    }

    @Override
    public AdminRegisterRequest toEntity(AdminRegisterRequestRequest registerRequest) {
        if ( registerRequest == null ) {
            return null;
        }

        AdminRegisterRequest.AdminRegisterRequestBuilder adminRegisterRequest = AdminRegisterRequest.builder();
        adminRegisterRequest.description( registerRequest.description() );

        return adminRegisterRequest.build();
    }
    protected User userDtoToUser(UserDto userDto) {
        if ( userDto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( userDto.id() );
        user.username( userDto.username() );

        return user.build();
    }
    protected UserDto userToUserDto(User user) {
        if ( user == null ) {
            return null;
        }

        Long id = null;
        String username = null;
        Long balance = null;
        Long debt = null;

        id = user.getId();
        username = user.getUsername();
        balance = user.getBalance();
        debt = user.getDebt();

        UserDto userDto = new UserDto( id, username, balance, debt );

        return userDto;
    }
}
