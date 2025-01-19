package com.labwork.islabfirst.controller;


import com.labwork.islabfirst.dto.ImportDto;
import com.labwork.islabfirst.dto.MovieDto;
import com.labwork.islabfirst.dto.PersonDto;
import com.labwork.islabfirst.dto.request.CreatePersonRequest;
import com.labwork.islabfirst.dto.request.UpdatePersonRequest;
import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.service.ImportService;
import com.labwork.islabfirst.service.PersonService;
import com.labwork.islabfirst.service.authorization.PersonSecurityService;
import io.minio.errors.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("api/person")
@RequiredArgsConstructor
public class PersonRestController {

    private final PersonService personService;
    private final ImportService importService;

    @GetMapping
    public ResponseEntity<Page<PersonDto>> findAll(
            @RequestParam(required = false) String name,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(personService.findAllWithFilters(name, pageable));
    }
    @PostMapping(value = "/imports", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ImportDto> importFile(@RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(personService.importFile(file));

    }


    @GetMapping("/{id}")
    public ResponseEntity<PersonDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(personService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PersonDto> create(@RequestBody CreatePersonRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(personService.create(request));
    }

    @PreAuthorize("@personSecurityService.hasEditRights(#id)")
    @PutMapping("/{id}")
    public ResponseEntity<PersonDto> update(
            @PathVariable Long id,
            @RequestBody UpdatePersonRequest request
    ) {

        return ResponseEntity.ok(personService.update(id, request));
    }

    @PreAuthorize("@personSecurityService.hasEditRights(#id)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        personService.delete(id);
        return ResponseEntity.ok().build();
    }

}
