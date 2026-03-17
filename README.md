
## 🚀 Tech Stack

- Java 17  
- Spring Boot 4.0.1  
- Spring Web  
- Spring Data JPA  
- Flyway  
- MySQL  
- MapStruct  
- Lombok  
- Thymeleaf  
- Maven  

## 🚀 Frontend Stack

- React.js
- React Dom
- Axios
- Tailwind CSS
- Xlsx
---

## 📦 Project Dependencies

Below are all dependencies used in this project:

```xml
<dependencies>

    <!-- Core Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <!-- Web / REST -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- JPA / Hibernate -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Flyway -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-flyway</artifactId>
    </dependency>

    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-mysql</artifactId>
    </dependency>

    <!-- MySQL Driver -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <scope>annotationProcessor</scope>
    </dependency>

    <!-- MapStruct -->
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.6.2</version>
    </dependency>

    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct-processor</artifactId>
        <version>1.6.3</version>
    </dependency>

    <!-- Thymeleaf -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

</dependencies>
```

---

## 🗄️ Database Configuration

- **Database:** `capstone`
- **Host:** `localhost`
- **Port:** `3306`
- **Username:** `root`

Flyway Maven Plugin configuration:

```xml
<plugin>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-maven-plugin</artifactId>
    <version>11.7.2</version>
    <configuration>
        <url>jdbc:mysql://localhost:3306/capstone?createDatabaseIfNotExist=true</url>
        <user>root</user>
        <password>YOUR_PASSWORD</password>
    </configuration>
</plugin>
```

⚠️ Update credentials according to your environment.

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/store.git
cd store
```

### 2. Ensure MySQL Is Running

Verify:
- MySQL is installed
- Port 3306 is available
- Credentials match your configuration

### 3. Run Flyway Migration (Optional)

```bash
mvn flyway:migrate
```

### 4. Run Application

```bash
mvn spring-boot:run
```

---

## 📂 Flyway Migrations

Place SQL files in:

```
src/main/resources/db/migration
```

Example:

```
V1__create_users_table.sql
V2__create_products_table.sql
```

Flyway automatically runs pending migrations on startup.

---

## 🧪 Running Tests

```bash
mvn test
```

---

## 🏗 Build Project

```bash
mvn clean install
```

---

## 🔧 Requirements

- Java 17
- MySQL 8+
- Maven
- Annotation processing enabled (for Lombok & MapStruct)

---

## 🛑 Challenges & Resolutions

Throughout the development of this project, several technical challenges were encountered and resolved. Here is a summary of the key issues and their fixes:

### 1. File Uploads Failing with Valid Data
- **Error:** Valid-looking data in Excel templates failed validation during upload, sometimes throwing generic 500 errors.
- **Root Cause:** The provided Excel template contained 3 non-data rows (header, instructions, example), but the backend was only configured to skip 1 row before attempting to parse data. Additionally, database constraint violations were unhandled, resulting in generic 500 errors instead of clear messages.
- **Resolution:** Updated the backend parser to skip the first 3 rows (`rowIndex++ < 3`). Added a `DataIntegrityViolationException` handler in `GlobalExceptionHandler` to return a clear **409 Conflict** with the actual database error message, which the frontend now displays properly.

### 2. 'Domain' Field Parsing Error in Excel Uploads
- **Error:** Uploading Faculty/Course Excel files resulted in failures originating from the 'Domain' field.
- **Root Cause:** An off-by-one error in the backend cell indexing logic caused the wrong cell to be read for the Domain field during parsing.
- **Resolution:** Corrected the cell index reading logic in the corresponding upload service. To prevent future data entry errors, implemented downloadable pre-formatted templates with strict data validation (dropdowns) using SheetJS (`xlsx`).

### 3. Debugging CRUD Operations & JSON Parsing
- **Error:** Infinite loops during JSON serialization/deserialization when fetching entities, leading to massive 500 responses or StackOverflow errors.
- **Root Cause:** Bidirectional JPA relationships (e.g., between `Course` and `Section` via `CourseMapping`) caused Jackson to infinitely recurse when mapping entities to JSON.
- **Resolution:** Applied `@JsonIgnoreProperties` strategically to the entity relationships (e.g., ignoring `courses` in the `Section` entity and vice-versa) to break the infinite recursion while preserving the necessary data for the frontend.

### 4. Database Schema & Startup Errors
- **Error:** Spring Boot application failed to start due to `BeanCreationException` and database schema validation errors.
- **Root Cause:** Foreign key constraint incompatibilities in the JPA entities (data types and field lengths not matching between primary and foreign keys) and missing Spring configuration annotations.
- **Resolution:** Corrected the `@Column` definitions (types and lengths) across related entities so foreign keys matched perfectly. Ensured all Repositories, Services, and Mappers had the appropriate Spring stereotype annotations (`@Repository`, `@Service`, `@Mapper(componentModel = "spring")`) to be correctly wired by the context.

### 5. Hibernate Stale Unique Key Constraint
- **Error:** `Duplicate entry 'CSE201-1-2' for key 'coursemapping.UKpx...'` when assigning courses to sections.
- **Root Cause:** The composite primary key for `CourseMapping` was expanded from 3 columns to 4 columns (adding `mapping_type`). However, Hibernate's `ddl-auto=update` never removes old constraints, leaving behind a 3-column unique key. When a course had both a Tutorial and Practical component (resulting in two rows with different mapping types), they clashed on the stale 3-column constraint.
- **Resolution:** Manually dropped the stale generated unique index in the MySQL database (`ALTER TABLE coursemapping DROP INDEX ...`). A reference document `# Debugging: Hibernate Stale Unique Key Constraint` was also created for future proofing.

---

## 📄 License

This project is private and not licensed for public use.  
All rights reserved.
