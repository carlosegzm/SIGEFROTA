package io.github.carlosegzm.frota_core.service;

import io.github.carlosegzm.frota_core.config.security.JwtService;
import io.github.carlosegzm.frota_core.domain.entities.User;
import io.github.carlosegzm.frota_core.domain.enums.UserRole;
import io.github.carlosegzm.frota_core.dto.request.LoginRequest;
import io.github.carlosegzm.frota_core.dto.request.RegisterRequest;
import io.github.carlosegzm.frota_core.dto.response.LoginResponse;
import io.github.carlosegzm.frota_core.dto.response.UserResponse;
import io.github.carlosegzm.frota_core.exception.custom.DuplicateResourceException;
import io.github.carlosegzm.frota_core.mapper.UserMapper;
import io.github.carlosegzm.frota_core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UserResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateResourceException("Email already registered!");
        }

        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.DRIVER);

        User newUser = userRepository.save(user);
        return UserMapper.toResponse(newUser);

    }

    public LoginResponse login (LoginRequest request) {

        Optional<User> optUser = userRepository.findByEmail(request.email());

        if (optUser.isEmpty() || !passwordEncoder.matches(request.password(), optUser.get().getPassword())) {
            throw new BadCredentialsException("Incorrect email or password!");
        }

        String token = jwtService.generateToken(optUser.get());
        return new LoginResponse(token);

    }

}
