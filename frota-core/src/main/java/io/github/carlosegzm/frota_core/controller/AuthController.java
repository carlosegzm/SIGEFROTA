package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.LoginRequest;
import io.github.carlosegzm.frota_core.dto.request.RegisterRequest;
import io.github.carlosegzm.frota_core.dto.response.LoginResponse;
import io.github.carlosegzm.frota_core.dto.response.UserResponse;
import io.github.carlosegzm.frota_core.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RequiredArgsConstructor
@RestController
@Tag(name = "Auth", description = "Registration and login")
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a user", description = "Creates a new account. New users always receive the DRIVER role.")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody @Valid RegisterRequest request) {
        UserResponse registered = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }

    @Operation(summary = "Login", description = "Authenticates with email and password and returns a JWT token.")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse login = authService.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(login);
    }


}
