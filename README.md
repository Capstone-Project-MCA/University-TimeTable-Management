# 🛒 Store Application

A Spring Boot–based backend application built with Java 17.  
This project integrates Spring Boot, JPA, Flyway, MySQL, MapStruct, and Thymeleaf.

---

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

## 📄 License

This project is private and not licensed for public use.  
All rights reserved.
