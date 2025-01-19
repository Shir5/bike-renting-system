package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.PersonDto;
import com.labwork.islabfirst.dto.request.CreatePersonRequest;
import com.labwork.islabfirst.dto.request.UpdatePersonRequest;
import com.labwork.islabfirst.mapper.EntityMapper;
import com.labwork.islabfirst.entity.model.Location;
import com.labwork.islabfirst.entity.model.Person;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring", uses = {Location.class})
public interface PersonMapper extends EntityMapper<PersonDto, Person> {
    Person toEntity(CreatePersonRequest request);

    Person toEntity(UpdatePersonRequest request);
}
