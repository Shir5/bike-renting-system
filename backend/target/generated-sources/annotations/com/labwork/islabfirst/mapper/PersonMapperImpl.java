package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.LocationDto;
import com.labwork.islabfirst.dto.PersonDto;
import com.labwork.islabfirst.dto.UserDto;
import com.labwork.islabfirst.dto.request.CreatePersonRequest;
import com.labwork.islabfirst.dto.request.UpdatePersonRequest;
import com.labwork.islabfirst.entity.model.Color;
import com.labwork.islabfirst.entity.model.Country;
import com.labwork.islabfirst.entity.model.Location;
import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.entity.security.User;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-01-19T01:10:32+0300",
    comments = "version: 1.6.2, compiler: javac, environment: Java 17.0.13 (Amazon.com Inc.)"
)
@Component
public class PersonMapperImpl implements PersonMapper {

    @Override
    public Person toEntity(PersonDto dto) {
        if ( dto == null ) {
            return null;
        }

        Person person = new Person();

        person.setOwner( userDtoToUser( dto.owner() ) );
        person.setId( dto.id() );
        person.setName( dto.name() );
        if ( dto.eyeColor() != null ) {
            person.setEyeColor( Enum.valueOf( Color.class, dto.eyeColor() ) );
        }
        if ( dto.hairColor() != null ) {
            person.setHairColor( Enum.valueOf( Color.class, dto.hairColor() ) );
        }
        person.setLocation( locationDtoToLocation( dto.location() ) );
        person.setBirthday( dto.birthday() );
        if ( dto.nationality() != null ) {
            person.setNationality( Enum.valueOf( Country.class, dto.nationality() ) );
        }

        return person;
    }

    @Override
    public PersonDto toDto(Person entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        String eyeColor = null;
        String hairColor = null;
        LocationDto location = null;
        LocalDateTime birthday = null;
        String nationality = null;
        UserDto owner = null;

        id = entity.getId();
        name = entity.getName();
        if ( entity.getEyeColor() != null ) {
            eyeColor = entity.getEyeColor().name();
        }
        if ( entity.getHairColor() != null ) {
            hairColor = entity.getHairColor().name();
        }
        location = locationToLocationDto( entity.getLocation() );
        birthday = entity.getBirthday();
        if ( entity.getNationality() != null ) {
            nationality = entity.getNationality().name();
        }
        owner = userToUserDto( entity.getOwner() );

        PersonDto personDto = new PersonDto( id, name, eyeColor, hairColor, location, birthday, nationality, owner );

        return personDto;
    }

    @Override
    public Person toEntity(CreatePersonRequest request) {
        if ( request == null ) {
            return null;
        }

        Person person = new Person();

        person.setName( request.name() );
        if ( request.eyeColor() != null ) {
            person.setEyeColor( Enum.valueOf( Color.class, request.eyeColor() ) );
        }
        if ( request.hairColor() != null ) {
            person.setHairColor( Enum.valueOf( Color.class, request.hairColor() ) );
        }
        person.setLocation( locationDtoToLocation( request.location() ) );
        person.setBirthday( request.birthday() );
        if ( request.nationality() != null ) {
            person.setNationality( Enum.valueOf( Country.class, request.nationality() ) );
        }

        return person;
    }

    @Override
    public Person toEntity(UpdatePersonRequest request) {
        if ( request == null ) {
            return null;
        }

        Person person = new Person();

        person.setName( request.name() );
        if ( request.eyeColor() != null ) {
            person.setEyeColor( Enum.valueOf( Color.class, request.eyeColor() ) );
        }
        if ( request.hairColor() != null ) {
            person.setHairColor( Enum.valueOf( Color.class, request.hairColor() ) );
        }
        person.setLocation( locationDtoToLocation( request.location() ) );
        person.setBirthday( request.birthday() );
        if ( request.nationality() != null ) {
            person.setNationality( Enum.valueOf( Country.class, request.nationality() ) );
        }

        return person;
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

    protected Location locationDtoToLocation(LocationDto locationDto) {
        if ( locationDto == null ) {
            return null;
        }

        Location.LocationBuilder location = Location.builder();

        location.x( locationDto.x() );
        if ( locationDto.y() != null ) {
            location.y( locationDto.y() );
        }
        if ( locationDto.z() != null ) {
            location.z( locationDto.z() );
        }

        return location.build();
    }

    protected LocationDto locationToLocationDto(Location location) {
        if ( location == null ) {
            return null;
        }

        Double x = null;
        Long y = null;
        Double z = null;

        x = location.getX();
        y = location.getY();
        z = location.getZ();

        LocationDto locationDto = new LocationDto( x, y, z );

        return locationDto;
    }

    protected UserDto userToUserDto(User user) {
        if ( user == null ) {
            return null;
        }

        Long id = null;
        String username = null;

        id = user.getId();
        username = user.getUsername();

        UserDto userDto = new UserDto( id, username );

        return userDto;
    }
}
