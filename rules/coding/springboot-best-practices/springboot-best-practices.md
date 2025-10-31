# SpringBoot Best Practices

You are a specialized SpringBoot development agent focused on creating robust, maintainable, and production-ready Spring Boot applications following industry best practices. This rule applies to both Java and Kotlin development.

## Core Principles

### Convention Over Configuration
- Follow Spring Boot's opinionated defaults and auto-configuration
- Use standard project structure and naming conventions
- Leverage Spring Boot starters for common functionality
- Minimize custom configuration when framework defaults suffice

### Dependency & Configuration Management
- Use Spring Boot's dependency management BOM and starters
- Keep dependencies up-to-date and avoid version conflicts
- Use `application.yml` for configuration with profile-specific files (`application-{profile}.yml`)
- Use `@ConfigurationProperties` for type-safe configuration binding
- Externalize environment-specific values; never hardcode sensitive information

## Architecture & Design Patterns

### Layered Architecture
**Controller** → **Service** → **Repository** → **Entity**

### Key Annotations
- **Controller**: `@RestController`, `@RequestMapping`, `@GetMapping/@PostMapping`, `@Valid`, `@PathVariable/@RequestParam`
- **Service**: `@Service`, `@Transactional`, implement proper exception handling
- **Repository**: `@Repository`, extend `JpaRepository<Entity, ID>`, use custom queries with `@Query`
- **Configuration**: `@Configuration`, `@Bean`, `@ConditionalOn*` for optional dependencies

## Data Access Best Practices

### JPA & Hibernate
- Use `@Entity` with proper `@Id` strategy (`@GeneratedValue`)
- Implement `equals()` and `hashCode()` based on business keys
- Use `@Transactional(readOnly = true)` for read-only operations
- Avoid N+1 queries with `@EntityGraph` or JOIN FETCH
- Use database migrations (Flyway/Liquibase) for schema management

### Repository Patterns
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.email = ?1")
    Optional<User> findByEmail(String email);
    
    @EntityGraph(attributePaths = {"roles", "profile"})
    List<User> findAllWithRolesAndProfile();
}
```

```kotlin
@Repository
interface UserRepository : JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.email = ?1")
    fun findByEmail(email: String): Optional<User>
    
    @EntityGraph(attributePaths = ["roles", "profile"])
    fun findAllWithRolesAndProfile(): List<User>
}
```

## Security Best Practices

### Modern Spring Security 6.x Configuration
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .build();
    }
}
```

### Security Essentials
- Use method-level security: `@PreAuthorize`, `@PostAuthorize`, `@Secured`
- Implement JWT/OAuth2 with proper token validation
- Use `@Valid` for input validation with custom validators
- Configure security headers (CSRF, CORS, Content Security Policy)
- Hash passwords with BCrypt, externalize secrets, use HTTPS in production

## Error Handling & Logging

### Global Exception Handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }
}
```

### Logging Best Practices
- Use SLF4J with Logback, configure structured logging (JSON) for production
- Set appropriate log levels per environment and package
- Use MDC for correlation IDs in distributed systems
- Never log sensitive information (passwords, tokens, PII)

## Testing Strategies

### Comprehensive Testing
- **Unit Tests**: `@ExtendWith(MockitoExtension.class)`, mock dependencies with `@Mock`
- **Integration Tests**: `@SpringBootTest`, `@TestPropertySource`, `@Sql` for test data
- **Web Layer**: `@WebMvcTest`, `MockMvc` for controller testing
- **Data Layer**: `@DataJpaTest` with `TestEntityManager`

### Modern Testing with TestContainers
```java
@SpringBootTest
@Testcontainers
class UserServiceIntegrationTest {
    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Test
    void shouldCreateUser() {
        // Test implementation with real database
    }
}
```

```kotlin
@SpringBootTest
@Testcontainers
class UserServiceIntegrationTest {
    companion object {
        @Container
        @ServiceConnection
        @JvmStatic
        val postgres = PostgreSQLContainer("postgres:15")
    }
    
    @Test
    fun `should create user`() {
        // Test implementation with real database
    }
}
```

### Security Testing
- Use `@WithMockUser` for authentication testing
- Test authorization with different roles and permissions
- Validate JWT token handling and OAuth2 flows

## Reactive Programming with Spring WebFlux

### When to Use Reactive
- High-concurrency, I/O-intensive applications
- Non-blocking data streams and backpressure handling
- Integration with reactive databases (R2DBC) and message systems

### Core Components
- **WebFlux**: `@RestController` with `Mono<T>` and `Flux<T>` return types
- **R2DBC**: Reactive database access with `ReactiveCrudRepository`
- **WebClient**: Non-blocking HTTP client for service-to-service communication

### Virtual Threads vs WebFlux (JVM 21+)
- Use Virtual Threads for simpler blocking code with high concurrency
- Use WebFlux for true reactive streams and backpressure management
- Configure: `spring.threads.virtual.enabled=true`

## Spring Boot 3.x Features

### Key Upgrades
- **Jakarta EE**: Migrate from `javax.*` to `jakarta.*` packages
- **JVM 17+**: Required baseline, leverage modern Java features
- **GraalVM Native**: Use `spring-boot-starter-native` for faster startup and lower memory
- **Observability**: Built-in Micrometer Tracing and enhanced Actuator endpoints

### Native Image Configuration
```yaml
# application.yml
spring:
  aot:
    enabled: true
management:
  tracing:
    sampling:
      probability: 1.0
```

## Performance & Monitoring

### Performance Optimization
- **Database**: Use HikariCP connection pooling, implement pagination, optimize queries
- **Caching**: Use `@Cacheable`, `@CacheEvict` with Redis or Caffeine
- **Async Processing**: Use `@Async` with proper thread pool configuration
- **Virtual Threads**: Enable for I/O-intensive applications (JVM 21+)

### Observability & Monitoring
```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  tracing:
    sampling:
      probability: 0.1
```

### Essential Monitoring
- **Actuator**: Enable health checks, metrics, and info endpoints
- **Micrometer**: Custom metrics with `@Timed`, `@Counted`
- **Distributed Tracing**: Use Zipkin/Jaeger with Micrometer Tracing
- **Logging**: Structured JSON logs with correlation IDs

## Deployment & Production

### Configuration Management
- Use environment variables for sensitive values
- Implement profile-specific configurations (dev, staging, prod)
- Configure connection pooling, JPA settings, and logging per environment
- Disable SQL logging and debug features in production

### Containerization
```dockerfile
FROM openjdk:21-jre-slim
COPY target/app.jar app.jar
RUN adduser --system --group appuser
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Production Checklist
- Use non-root containers with health checks
- Configure graceful shutdown and proper JVM settings
- Implement secret management and feature flags
- Set up monitoring, alerting, and log aggregation

## Code Quality & Anti-Patterns

### Best Practices
- Follow language-specific style guides and use static analysis tools
- Implement consistent formatting with automated tools (Spotless, ktlint)
- Use dependency injection over static methods
- Prefer composition over inheritance

### Common Anti-Patterns to Avoid
- ❌ Using `@Autowired` on fields (use constructor injection)
- ❌ Catching generic `Exception` without proper handling
- ❌ Hardcoding configuration values in source code
- ❌ Using `@Transactional` on private methods (won't work)
- ❌ Ignoring database connection pooling configuration
- ❌ Using blocking operations in reactive streams

### ✅ Good Practices
- Use constructor injection with `final` fields
- Implement specific exception handling with proper HTTP status codes
- Use `@ConfigurationProperties` for external configuration
- Apply `@Transactional` on public service methods
- Configure HikariCP connection pool settings
- Use non-blocking operations in reactive applications

## Implementation Checklist

### Project Setup
- [ ] Use Spring Initializr with appropriate starters
- [ ] Configure multi-environment profiles (application-{env}.yml)
- [ ] Set up database migrations (Flyway/Liquibase)
- [ ] Configure security (authentication & authorization)

### Development
- [ ] Implement layered architecture (Controller → Service → Repository)
- [ ] Add comprehensive testing (unit, integration, security)
- [ ] Configure caching and performance optimizations
- [ ] Set up monitoring and observability

### Production Readiness
- [ ] Containerize application with proper security
- [ ] Configure environment-specific settings
- [ ] Set up monitoring, logging, and alerting
- [ ] Implement CI/CD pipeline with automated testing

## Language-Specific Considerations

### Java Development
- Use records for DTOs and value objects (Java 14+)
- Leverage pattern matching and sealed classes (Java 17+)
- Use text blocks for multi-line strings and SQL queries

### Kotlin Development
- Leverage null safety, data classes, and extension functions
- Use coroutines for asynchronous programming with Spring WebFlux
- Take advantage of Kotlin's DSL capabilities for configuration
- Use `@JvmStatic` for companion object methods accessed from Java
- Prefer Kotlin's `fun` interface declarations and property syntax

### Cross-Language Best Practices
- Use Spring's annotation-based configuration (works identically in both languages)
- Follow consistent naming conventions and project structure
- Leverage Spring Boot's auto-configuration and starters
- Use the same testing strategies and frameworks (JUnit 5, Mockito, TestContainers)

---

This rule provides comprehensive guidance for building production-ready Spring Boot applications. Follow Spring Boot's conventions, prioritize security and testing, and leverage modern JVM features for optimal performance and maintainability.