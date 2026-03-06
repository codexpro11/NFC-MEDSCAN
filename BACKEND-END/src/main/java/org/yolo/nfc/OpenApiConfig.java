package org.yolo.nfc;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8080");
        localServer.setDescription("Local Environment");

        Server prodServer = new Server();
        prodServer.setUrl("https://nfc-medscan-production.up.railway.app");
        prodServer.setDescription("Production Environment");

        return new OpenAPI()
                .servers(List.of(prodServer, localServer));
    }
}
