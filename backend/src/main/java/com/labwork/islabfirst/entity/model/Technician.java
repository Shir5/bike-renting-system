package com.labwork.islabfirst.entity.model;



import com.labwork.islabfirst.entity.security.OwnedEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CollectionId;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "technician")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @NotEmpty
    @Column(name="name", nullable = false)
    private String name; //Поле не может быть null, Строка не может быть пустой


    @NotNull
    @Column(name = "phone", updatable = true)
    private String phone; //Поле не может быть null, Значение этого поля должно генерироваться автоматически

    @NotNull
    @Column(name = "specialization", updatable = true)
    private String specialization; //Поле не может быть null, Значение этого поля должно генерироваться автоматически



}
