package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.domain.entities.User;
import io.github.carlosegzm.frota_core.domain.enums.UserRole;
import io.github.carlosegzm.frota_core.dto.request.UserRoleRequest;
import io.github.carlosegzm.frota_core.dto.response.UserResponse;
import io.github.carlosegzm.frota_core.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    // CHANGE ROLE

    @Test
    @DisplayName("Should update role when user exists")
    void changeRole_shouldUpdateRole_whenUserExists() {
        UUID id = UUID.randomUUID();

        UserRoleRequest request = new UserRoleRequest(UserRole.FLEET_MANAGER);

        User user = User.builder()
                .id(id)
                .role(UserRole.DRIVER)
                .build();

        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));

        UserResponse response = userService.changeRole(id, request);

        assertEquals(request.role(), response.role());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when user is not found")
    void changeRole_shouldThrowException_whenUserNotFound() {
        UUID id = UUID.randomUUID();

        UserRoleRequest request = new UserRoleRequest(UserRole.FLEET_MANAGER);

        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> userService.changeRole(id, request));
        verify(userRepository, never()).save(any());
    }

    // LIST ALL

    @Test
    @DisplayName("Should return all users")
    void listAll_shouldReturnAllUsers() {
        User user1 = User.builder()
                .id(UUID.randomUUID())
                .name("Michael")
                .role(UserRole.DRIVER)
                .build();

        User user2 = User.builder()
                .id(UUID.randomUUID())
                .name("Franklin")
                .role(UserRole.FINANCE)
                .build();

        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        List<UserResponse> responses = userService.listAll();

        assertEquals(responses.size(), 2);
        assertEquals("Michael", responses.getFirst().name());
        assertEquals(UserRole.FINANCE, responses.getLast().role());
    }


}