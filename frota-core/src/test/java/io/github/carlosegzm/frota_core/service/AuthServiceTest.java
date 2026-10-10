package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.config.security.JwtService;
import io.github.carlosegzm.frota_core.domain.entities.User;
import io.github.carlosegzm.frota_core.domain.enums.UserRole;
import io.github.carlosegzm.frota_core.dto.request.LoginRequest;
import io.github.carlosegzm.frota_core.dto.request.RegisterRequest;
import io.github.carlosegzm.frota_core.dto.response.LoginResponse;
import io.github.carlosegzm.frota_core.dto.response.UserResponse;
import io.github.carlosegzm.frota_core.exception.custom.DuplicateResourceException;
import io.github.carlosegzm.frota_core.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;


    // -> REGISTER <-

    @Test
    @DisplayName("Should create user when email is new")
    void register_shouldCreateUser_whenEmailIsNew() {
        RegisterRequest request = new RegisterRequest(
                "Carlos Eduardo",
                "carlos@email.com",
                "password1234"
        );

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocationOnMock -> invocationOnMock.getArgument(0));
        when(passwordEncoder.encode(request.password())).thenReturn("encrypted");

        UserResponse response = authService.register(request);
        assertNotNull(response);
        assertEquals("carlos@email.com", response.email());
        assertEquals(UserRole.DRIVER, response.role());
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void register_shouldThrowException_whenEmailAlreadyExists() {
        User existingUser = User.builder()
                .id(UUID.randomUUID())
                .email("carlos@email.com")
                .build();

        RegisterRequest request = new RegisterRequest(
                "Carlos Eduardo",
                "carlos@email.com",
                "password1234"
        );

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(existingUser));

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    // -> Login <-

    @Test
    @DisplayName("Should return token when credentials are valid")
    void login_shouldReturnToken_whenCredentialsAreValid() {
        LoginRequest request = new LoginRequest(
                "carlos@email.com",
                "password1234"
        );

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(request.email())
                .build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPassword())).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("JWT_Token");

        LoginResponse response = authService.login(request);
        assertEquals("JWT_Token", response.token());
    }

    @Test
    @DisplayName("Should throw exception when email is not found")
    void login_shouldThrowException_whenEmailNotFound() {
        LoginRequest request = new LoginRequest(
                "carlos@email.com",
                "password1234"
        );

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should throw exception when password does not match")
    void login_shouldThrowException_whenPasswordDoesNotMatch() {
        LoginRequest request = new LoginRequest(
                "carlos@email.com",
                "password1234"
        );

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(request.email())
                .build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPassword())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }


}