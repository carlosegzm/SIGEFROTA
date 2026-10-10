package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.User;
import io.github.carlosegzm.frota_core.dto.request.UserRoleRequest;
import io.github.carlosegzm.frota_core.dto.response.UserResponse;
import io.github.carlosegzm.frota_core.exception.custom.ResourceNotFoundException;
import io.github.carlosegzm.frota_core.mapper.UserMapper;
import io.github.carlosegzm.frota_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse changeRole(UUID id, UserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setRole(request.role());
        User updatedUser = userRepository.save(user);

        return UserMapper.toResponse(updatedUser);
    }


}
