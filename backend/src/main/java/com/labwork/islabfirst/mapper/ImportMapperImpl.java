package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.ImportDto;
import com.labwork.islabfirst.entity.security.Import;
import com.labwork.islabfirst.entity.security.ImportType;
import com.labwork.islabfirst.entity.security.OperationStatus;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Component
public class ImportMapperImpl implements ImportMapper {

    @Override
    public Import toEntity(ImportDto dto) {
        if ( dto == null ) {
            return null;
        }

        Import import1 = new Import();

        import1.setId( dto.id() );
        import1.setStatus( dto.status() );
        import1.setUserId( dto.userId() );
        import1.setAddedObjects(dto.objectsAdded());
        import1.setCreatedAt( dto.createdAt() );
        import1.setImportType( dto.importType() );

        return import1;
    }

    @Override
    public ImportDto toDto(Import entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        Long userId = null;
        OperationStatus status = null;
        LocalDateTime createdAt = null;
        Long addedObjects = null;
        ImportType importType = null;

        id = entity.getId();
        userId = entity.getUserId();
        status = entity.getStatus();
        createdAt = entity.getCreatedAt();
        importType = entity.getImportType();
        addedObjects = entity.getAddedObjects();


        ImportDto importDto = new ImportDto( id, userId, status, addedObjects, createdAt, importType );

        return importDto;
    }
}
