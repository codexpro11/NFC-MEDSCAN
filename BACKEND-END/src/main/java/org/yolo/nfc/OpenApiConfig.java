package org.yolo.nfc;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        // ✅ Fix 1: localServer first — Swagger UI defaults to the first entry.
        // Putting prod first means local testing accidentally hits your live backend.
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8080");
        localServer.setDescription("Local Environment");

        Server prodServer = new Server();
        prodServer.setUrl("https://nfc-medscan-production.up.railway.app");
        prodServer.setDescription("Production Environment");

        // ✅ Fix 2: JWT security scheme — adds the 🔒 Authorize button to Swagger UI.
        // Without this, every protected endpoint returns 401 and can't be tested.
        SecurityScheme jwtScheme = new SecurityScheme()
                .name(SECURITY_SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Paste your JWT token (without 'Bearer ' prefix). " +
                             "Get one from POST /api/auth/login or /api/auth/register");

        // ✅ Fix 3: API metadata — title, version, description shown in Swagger UI header
        Info apiInfo = new Info()
                .title("NFC MedScan API")
                .version("1.0.0")
                .description("REST API for NFC-based patient data management. " +
                             "JWT authentication required for all endpoints except /api/auth/**");

        return new OpenAPI()
                .info(apiInfo)
                .servers(List.of(localServer, prodServer))  // local first!
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME_NAME, jwtScheme));
    }
}
