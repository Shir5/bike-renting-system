package com.labwork.islabfirst.service.authorization;

import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PersonSecurityService extends OwnedService<Person, Long> {
    private final PersonRepository personRepository;

    @Override
    protected Person findById(Long id) {
        return personRepository.findById(id).orElseThrow();
    }
}
