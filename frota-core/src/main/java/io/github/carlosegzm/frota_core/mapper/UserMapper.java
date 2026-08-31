package io.github.carlosegzm.frota_core.mapper;

import io.github.carlosegzm.frota_core.domain.entities.User;
import io.github.carlosegzm.frota_core.dto.request.RegisterRequest;
import io.github.carlosegzm.frota_core.dto.response.UserResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {

    public static User toEntity(RegisterRequest request) {
        return User.builder()
                .name(request.name())
                .email(request.email())
                .build();
    }

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

}
