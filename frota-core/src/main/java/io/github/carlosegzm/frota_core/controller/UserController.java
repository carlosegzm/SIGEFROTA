package io.github.carlosegzm.frota_core.controller;

import io.github.carlosegzm.frota_core.dto.request.UserRoleRequest;
import io.github.carlosegzm.frota_core.dto.response.UserResponse;
import io.github.carlosegzm.frota_core.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@Tag(name = "Users", description = "User and role management")
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "List users", description = "Requires the FLEET_MANAGER role.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @GetMapping
    public ResponseEntity<List<UserResponse>> listAll() {
        List<UserResponse> usersList = userService.listAll();
        return ResponseEntity.status(HttpStatus.OK).body(usersList);
    }

    @Operation(summary = "Change user role", description = "Changes the role of a user. Requires the FLEET_MANAGER role. The change takes effect on the user's next login.")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> changeRole(@PathVariable UUID id, @RequestBody @Valid UserRoleRequest request) {
        UserResponse updatedUser = userService.changeRole(id, request);
        return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
    }





}
