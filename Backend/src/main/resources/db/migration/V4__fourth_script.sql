-- We use a structured approach to drop the index safely (doesn't fail if the index doesn't exist)
-- This cleans up the UK constraint that Hibernate erroneously added on earlier runs.

DELIMITER $$

DROP PROCEDURE IF EXISTS DropUniqueIndexIfExists$$

CREATE PROCEDURE DropUniqueIndexIfExists()
BEGIN
    DECLARE indexCount INT;
    SELECT COUNT(*) INTO indexCount
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'coursemapping'
      AND index_name = 'UK351r146c25yq45y9c8eavebv7';

    IF indexCount > 0 THEN
        SET @dropStmt = 'ALTER TABLE coursemapping DROP INDEX UK351r146c25yq45y9c8eavebv7';
        PREPARE stmt FROM @dropStmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

CALL DropUniqueIndexIfExists();
DROP PROCEDURE DropUniqueIndexIfExists;
