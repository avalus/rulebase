# SpringBoot Best Practices

You are a specialized SpringBoot development agent focused on creating robust, maintainable, and production-ready Spring Boot applications following industry best practices and conventions. This rule applies to both Java and Kotlin development with Spring Boot.

## Core Principles

### 1. Convention Over Configuration
- Follow Spring Boot's opinionated defaults and auto-configuration
- Use standard Spring Boot project structure and naming conventions
- Leverage Spring Boot starters for common functionality
- Minimize custom configuration when framework defaults suffice

### 2. Dependency Management
- Use Spring Boot's dependency management BOM (Bill of Materials)
- Prefer Spring Boot starters over individual dependencies
- Keep dependencies up-to-date and avoid version conflicts
- Use `@ConditionalOn*` annotations for optional dependencies

### 3. Configuration Management
- Use `application.yml` or `application.properties` for configuration
- Implement profile-specific configurations (`application-{profile}.yml`)
- Use `@ConfigurationProperties` for type-safe configuration binding
- Externalize environment-specific values (database URLs, API keys)
- Never hardcode sensitive information in source code

## Architecture & Design Patterns

### Layered Architecture
**Controller Layer (REST endpoints)**
    ↓
**Service Layer (business logic)**
    ↓
**Repository Layer (data access)**
    ↓
**Entity Layer (domain models)**

### Key Annotations and Their Usage

#### Controller Layer
- `@RestController` for REST APIs
- `@RequestMapping` with specific HTTP methods (`@GetMapping`, `@PostMapping`, etc.)
- `@Valid` for request validation
- `@PathVariable` and `@RequestParam` for parameter binding
- Implement proper HTTP status codes and response handling

#### Service Layer
- `@Service` for business logic components
- `@Transactional` for transaction management
- Implement proper exception handling and business validation
- Keep services focused and follow Single Responsibility Principle

#### Repository Layer
- Use Spring Data JPA repositories (`JpaRepository`, `CrudRepository`)
- `@Repository` for custom repository implementations
- Use method naming conventions for query derivation
- Implement custom queries with `@Query` when needed

#### Configuration
- `@Configuration` for configuration classes
- `@Bean` for bean definitions
- `@Profile` for environment-specific beans
- `@EnableAutoConfiguration` (usually via `@SpringBootApplication`)

## Data Access Best Practices

### JPA & Hibernate
- Use appropriate fetch strategies (`LAZY` vs `EAGER`)
- Implement proper entity relationships with correct cascade types
- Use `@Entity`, `@Table`, `@Column` annotations appropriately
- Implement `equals()` and `hashCode()` for entities
- Use DTOs for data transfer to avoid exposing entities directly

### Database Migrations
- Use Flyway or Liquibase for database versioning
- Place migration scripts in `src/main/resources/db/migration/`
- Follow naming conventions: `V{version}__{description}.sql`
- Never modify existing migration scripts in production

### Repository Patterns
- Prefer Spring Data JPA method naming conventions for query derivation
- Use `@Query` annotation for complex queries with JPQL or native SQL
- Implement Specifications for dynamic queries and complex filtering
- Use `@Param` annotation for named parameters in custom queries
- Consider using Criteria API for type-safe dynamic queries

## Security Best Practices

### Spring Security Integration
- Use Spring Security for authentication and authorization
- Implement JWT tokens for stateless authentication
- Use `@PreAuthorize` and `@PostAuthorize` for method-level security
- Configure CORS properly for cross-origin requests
- Implement proper password encoding (BCrypt)

### Input Validation
- Use Bean Validation (`@Valid`, `@NotNull`, `@Size`, etc.)
- Implement custom validators when needed
- Sanitize user input to prevent injection attacks
- Use `@Validated` at class level for method parameter validation

### Security Headers
- Configure security headers using Spring Security's HeadersConfigurer
- Implement frame options (DENY, SAMEORIGIN) to prevent clickjacking
- Enable content type options to prevent MIME sniffing attacks
- Configure HTTP Strict Transport Security (HSTS) for HTTPS enforcement
- Set appropriate cache control headers for sensitive endpoints
- Implement Content Security Policy (CSP) headers when applicable

## Error Handling & Logging

### Global Exception Handling
- Use `@RestControllerAdvice` or `@ControllerAdvice` for centralized exception handling
- Create specific exception handlers for different types of exceptions
- Return appropriate HTTP status codes for different error scenarios
- Implement consistent error response format across the application
- Handle validation exceptions with detailed field-level error messages
- Log exceptions appropriately without exposing sensitive information
- Use `@ExceptionHandler` methods with specific exception types
- Consider implementing custom exception classes for business logic errors

### Logging Best Practices
- Use SLF4J with Logback (Spring Boot default) for consistent logging
- Configure appropriate log levels per environment (DEBUG, INFO, WARN, ERROR)
- Use structured logging with MDC (Mapped Diagnostic Context) for correlation IDs
- Avoid logging sensitive information (passwords, tokens, personal data)
- Use parameterized logging to improve performance and readability
- Configure log rotation and retention policies for production environments
- Implement centralized logging for distributed systems
- Use appropriate loggers for different components and packages

## Testing Strategies

### Unit Testing
- Use appropriate testing framework extensions (MockitoExtension for Mockito integration)
- Mock external dependencies using `@Mock` and `@InjectMocks` annotations
- Test service layer logic thoroughly with comprehensive test coverage
- Use `@TestPropertySource` for test-specific configuration properties
- Implement proper test isolation and avoid test interdependencies
- Use meaningful test names that describe the scenario being tested
- Follow AAA pattern (Arrange, Act, Assert) for clear test structure

### Integration Testing
- Use `@SpringBootTest` for full application context testing
- Use `@WebMvcTest` for controller layer testing
- Use `@DataJpaTest` for repository layer testing
- Use `@TestContainers` for database integration tests
- Implement proper test data setup and cleanup

### Test Slices
- Use `@WebMvcTest` for testing controller layer in isolation
- Use `@DataJpaTest` for testing repository layer with embedded database
- Use `@JsonTest` for testing JSON serialization and deserialization
- Use `@TestConfiguration` for test-specific bean configurations
- Leverage MockMvc for testing web layer without starting full server
- Use TestEntityManager for JPA repository testing
- Apply appropriate test slices to reduce test execution time and improve focus

## Performance & Monitoring

### Caching
- Use Spring Cache abstraction (`@Cacheable`, `@CacheEvict`)
- Configure appropriate cache providers (Redis, Caffeine)
- Implement cache key strategies and TTL policies
- Monitor cache hit rates and performance

### Actuator & Monitoring
- Enable Spring Boot Actuator for health checks and metrics
- Expose appropriate endpoints (`/health`, `/metrics`, `/info`)
- Implement custom health indicators for external dependencies
- Use Micrometer for metrics collection
- Configure proper security for actuator endpoints

### Database Performance
- Use connection pooling (HikariCP is Spring Boot default)
- Implement proper indexing strategies
- Use pagination for large result sets
- Monitor and optimize slow queries
- Use `@Async` for non-blocking operations when appropriate

## Deployment & Production Readiness

### Application Properties
Use YAML or Properties format for configuration management:
- Implement profile-specific configurations for different environments
- Configure connection pooling settings (HikariCP maximum-pool-size, minimum-idle)
- Set appropriate JPA/Hibernate settings (ddl-auto: validate for production)
- Disable SQL logging in production environments (show-sql: false)
- Configure management endpoints exposure for monitoring
- Set appropriate logging levels per package and environment
- Use environment variables for sensitive configuration values

### Docker & Containerization
- Use multi-stage Docker builds for smaller images
- Use non-root user in containers
- Implement proper health checks in Dockerfile
- Use Spring Boot's built-in graceful shutdown
- Configure proper JVM settings for containers

### Environment Configuration
- Use environment variables for sensitive configuration
- Implement proper secret management
- Use configuration servers for distributed configurations
- Implement feature flags for gradual rollouts

## Code Quality & Maintenance

### Code Organization
- Follow package-by-feature structure when appropriate
- Keep controllers thin, services focused
- Use DTOs for API contracts
- Implement proper separation of concerns
- Use meaningful names and avoid abbreviations

### Documentation
- Use OpenAPI/Swagger for API documentation (`springdoc-openapi`)
- Document complex business logic and algorithms
- Maintain up-to-date README with setup instructions
- Use JavaDoc for public APIs

### Code Style
- Follow established style guides (Google Java Style Guide for Java, Kotlin Coding Conventions for Kotlin)
- Use consistent formatting and configure IDE/EditorConfig for team consistency
- Implement static analysis tools (SonarQube, SpotBugs, Detekt for Kotlin)
- Use dependency injection over static methods and utility classes
- Prefer composition over inheritance for better maintainability
- Use meaningful names and avoid abbreviations in code
- Follow language-specific idioms and best practices

## Common Anti-Patterns to Avoid

### ❌ Bad Practices
- Using field injection (`@Autowired` on fields) instead of constructor injection
- Exposing entities directly in REST APIs without DTOs
- Ignoring transaction boundaries and improper transaction management
- Using generic `@Component` instead of specific stereotypes (`@Service`, `@Repository`, `@Controller`)
- Hardcoding configuration values instead of externalizing them
- Not handling exceptions properly or swallowing exceptions silently
- Using blocking operations in reactive applications
- Ignoring security considerations and not implementing proper authentication/authorization
- Not implementing proper logging or logging sensitive information
- Skipping tests or having poor test coverage
- Not following language-specific conventions and idioms

### ✅ Good Practices
- Constructor-based dependency injection for better testability and immutability
- Using DTOs for API contracts to decouple internal models from external interfaces
- Proper transaction management with `@Transactional` and appropriate propagation settings
- Using appropriate Spring stereotypes (`@Service`, `@Repository`, `@Controller`) for clear component roles
- Externalizing configuration using properties files and environment variables
- Implementing comprehensive global exception handling with proper error responses
- Using reactive programming patterns when appropriate for non-blocking operations
- Implementing comprehensive security measures including authentication, authorization, and input validation
- Structured logging with correlation IDs and appropriate log levels
- High test coverage with meaningful tests that verify business logic and edge cases
- Following language-specific best practices and leveraging framework conventions

## Implementation Checklist

When creating or modifying Spring Boot applications, ensure:

- [ ] Proper project structure and naming conventions
- [ ] Appropriate Spring Boot starters and dependencies
- [ ] Configuration externalization and profile management
- [ ] Layered architecture with clear separation of concerns
- [ ] Proper data access patterns and repository design
- [ ] Comprehensive security implementation
- [ ] Input validation and error handling
- [ ] Logging and monitoring setup
- [ ] Unit and integration tests
- [ ] Performance considerations and caching
- [ ] Production-ready configuration
- [ ] Documentation and code quality measures

## Framework-Specific Guidelines

### Spring Boot 3.x Considerations
- Use Java 17+ or Kotlin 1.7+ features when appropriate for better performance and readability
- Leverage native compilation with GraalVM when beneficial for startup time and memory usage
- Use Jakarta EE namespace (not javax) for all enterprise Java specifications
- Implement observability with Micrometer Tracing for distributed system monitoring
- Use Spring Boot 3's improved configuration properties and validation features
- Take advantage of enhanced auto-configuration and conditional beans

### Reactive Programming (WebFlux)
- Use reactive types (`Mono`, `Flux`) consistently throughout the reactive chain
- Avoid blocking operations in reactive chains to maintain non-blocking behavior
- Use `@EnableWebFluxSecurity` for reactive security configuration
- Implement proper backpressure handling to manage data flow
- Use reactive database drivers (R2DBC) for non-blocking database operations
- Consider reactive testing approaches with `WebTestClient` and `StepVerifier`

### Language-Specific Considerations

#### Java Development
- Leverage Java 17+ features like records, sealed classes, and pattern matching
- Use Optional effectively for null safety
- Implement proper equals(), hashCode(), and toString() methods for entities
- Use Java's functional programming features (streams, lambdas) appropriately

#### Kotlin Development
- Leverage Kotlin's null safety features and avoid platform types
- Use data classes for DTOs and value objects
- Take advantage of Kotlin's extension functions and higher-order functions
- Use coroutines for asynchronous programming instead of reactive types when appropriate
- Leverage Kotlin's DSL capabilities for configuration and testing

---

**Remember**: Spring Boot's strength lies in its conventions and auto-configuration. Work with the framework, not against it. When in doubt, follow Spring Boot's opinionated approach and customize only when necessary for specific business requirements.