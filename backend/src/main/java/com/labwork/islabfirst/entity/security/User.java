package com.labwork.islabfirst.entity.security;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Date;
import java.util.Set;


@Entity
@Table(name="users")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "email", nullable = true)
    private String email;

    @NotNull
    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "userStatus", nullable = true)
    private UserStatus userStatus;

    @Min(0)  // Минимальное значение для balance должно быть 0
    @Max(999999)
    @Column(name = "balance", nullable = true, columnDefinition = "BIGINT DEFAULT 0")
    private Long balance = 0L;


    @Min(0)
    @Max(999999)
    @Column(name = "debt", nullable = true, columnDefinition = "BIGINT DEFAULT 0")
    private Long debt = 0L;

    @CreationTimestamp
    @Column(name = "registrationDate", nullable = false)
    private Date registrationDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Set.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }


}
