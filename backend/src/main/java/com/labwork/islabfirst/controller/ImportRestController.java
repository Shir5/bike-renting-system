package com.labwork.islabfirst.controller;

import com.labwork.islabfirst.dto.ImportDto;
import com.labwork.islabfirst.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("api/imports")
@RequiredArgsConstructor
public class ImportRestController {

    private final ImportService importService;


    @GetMapping
    public ResponseEntity<Page<ImportDto>> findAllImports(
            @RequestParam(required = false) String name,
            @PageableDefault Pageable pageable
    ) {
        Page<ImportDto> result = importService.findAllImportByUser(name, pageable);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImport(@PathVariable Long id) {
        try {
            importService.deleteImport(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
