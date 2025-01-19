package com.labwork.islabfirst.service.authorization;

import com.labwork.islabfirst.entity.security.OwnedEntity;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.entity.security.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public abstract class OwnedService<T extends OwnedEntity, ID> {
    protected abstract T findById(ID id);


    public boolean isOwner(ID ownedEntityId) {
        var entity = findById(ownedEntityId);
        var currentUser = getCurrentUser();

        return isOwner(currentUser, entity);
    }


    public boolean hasEditRights(ID ownedEntityId) {
        var entity = findById(ownedEntityId);
        var currentUser = getCurrentUser();

        return hasEditRights(currentUser, entity);
    }

    private boolean isOwner(User user, OwnedEntity entity) {
        return entity.getOwner().getId().equals(user.getId());
    }


    private boolean hasEditRights(User user, OwnedEntity entity) {
        boolean isOwner = isOwner(user, entity);
        boolean isAdminAndIsAdminEditAllowed = user.getRole() == Role.ADMIN;

        return isOwner || isAdminAndIsAdminEditAllowed;
    }

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}
