-- MySQL dump 10.13  Distrib 5.7.24, for osx11.1 (x86_64)
--
-- Host: localhost    Database: capstone
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `coursemapping`
--

DROP TABLE IF EXISTS `coursemapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coursemapping` (
  `coursecode` varchar(7) NOT NULL,
  `group_no` smallint NOT NULL,
  `section` varchar(5) NOT NULL,
  `mapping_type` varchar(255) NOT NULL,
  `attendance_type` varchar(15) NOT NULL,
  `course_nature` varchar(1) NOT NULL,
  `facultyuid` varchar(5) DEFAULT NULL,
  `l` smallint NOT NULL,
  `merge_status` bit(1) NOT NULL,
  `mergecode` varchar(7) DEFAULT NULL,
  `p` smallint NOT NULL,
  `reserveslot` varchar(50) DEFAULT NULL,
  `t` smallint NOT NULL,
  `GroupNo` smallint NOT NULL,
  `MappingType` varchar(255) NOT NULL,
  `AttendanceType` varchar(15) NOT NULL,
  `CourseNature` varchar(1) NOT NULL,
  `MergeStatus` bit(1) NOT NULL,
  PRIMARY KEY (`coursecode`,`group_no`,`section`,`mapping_type`),
  KEY `FKjh5h5alwl9lm82u4ef7caoe7h` (`facultyuid`),
  KEY `FK9kn6v7e2ywuugycv7vucyji7w` (`section`),
  CONSTRAINT `FK9kn6v7e2ywuugycv7vucyji7w` FOREIGN KEY (`section`) REFERENCES `sectionmaster` (`section_id`),
  CONSTRAINT `FKjh5h5alwl9lm82u4ef7caoe7h` FOREIGN KEY (`facultyuid`) REFERENCES `facultymaster` (`facultyuid`),
  CONSTRAINT `FKjr7snj7ic69w8lc4g2jrlv53f` FOREIGN KEY (`coursecode`) REFERENCES `coursemaster` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursemapping`
--

LOCK TABLES `coursemapping` WRITE;
/*!40000 ALTER TABLE `coursemapping` DISABLE KEYS */;
INSERT INTO `coursemapping` VALUES ('CSE101',0,'1','L','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',0,'2','L','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',1,'1','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',1,'1','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',1,'2','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',1,'2','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',2,'1','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',2,'1','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',2,'2','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',2,'2','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',3,'1','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE101',3,'1','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',0,'1','L','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',0,'2','L','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',1,'1','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',1,'1','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',1,'2','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',1,'2','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',2,'1','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',2,'1','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',2,'2','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',2,'2','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',3,'1','P','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0'),('CSE102',3,'1','T','Regular','C',NULL,3,_binary '\0',NULL,2,NULL,1,0,'','','',_binary '\0');
/*!40000 ALTER TABLE `coursemapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursemaster`
--

DROP TABLE IF EXISTS `coursemaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coursemaster` (
  `course_code` varchar(255) NOT NULL,
  `course_nature` varchar(1) DEFAULT NULL,
  `course_title` varchar(255) DEFAULT NULL,
  `course_type` varchar(255) DEFAULT NULL,
  `credit` smallint DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `l` smallint DEFAULT NULL,
  `p` smallint DEFAULT NULL,
  `t` smallint DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `CourseCode` varchar(255) NOT NULL,
  `CourseNature` varchar(1) DEFAULT NULL,
  `CourseTitle` varchar(255) DEFAULT NULL,
  `CourseType` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursemaster`
--

LOCK TABLES `coursemaster` WRITE;
/*!40000 ALTER TABLE `coursemaster` DISABLE KEYS */;
INSERT INTO `coursemaster` VALUES ('CSE101','C','Data Structures','CR',4,'CSE',3,2,1,'Important course','',NULL,NULL,NULL),('CSE102','C','Database Management Systems','CR',4,'CSE',3,2,1,'Lab included','',NULL,NULL,NULL),('CSE201','C','Operating Systems','CR',4,'CSE',3,2,1,'Requires DS knowledge','',NULL,NULL,NULL),('CSE305','L','Machine Learning','CR',4,'AI',3,2,0,'Advanced elective','',NULL,NULL,NULL);
/*!40000 ALTER TABLE `coursemaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facultymaster`
--

DROP TABLE IF EXISTS `facultymaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facultymaster` (
  `facultyuid` varchar(5) NOT NULL,
  `current_load` smallint NOT NULL,
  `expected_load` smallint NOT NULL,
  `faculty_domain` varchar(20) NOT NULL,
  `faculty_name` varchar(50) NOT NULL,
  `CurrentLoad` smallint NOT NULL,
  `ExpectedLoad` smallint NOT NULL,
  `FacultyDomain` varchar(20) NOT NULL,
  `FacultyName` varchar(50) NOT NULL,
  PRIMARY KEY (`facultyuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facultymaster`
--

LOCK TABLES `facultymaster` WRITE;
/*!40000 ALTER TABLE `facultymaster` DISABLE KEYS */;
/*!40000 ALTER TABLE `facultymaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roommaster`
--

DROP TABLE IF EXISTS `roommaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roommaster` (
  `room_no` varchar(10) NOT NULL,
  `level` smallint NOT NULL,
  `room_type` smallint NOT NULL,
  `seating_capacity` smallint NOT NULL,
  `RoomNo` varchar(10) NOT NULL,
  `RoomType` smallint NOT NULL,
  `SeatingCapacity` smallint NOT NULL,
  PRIMARY KEY (`room_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roommaster`
--

LOCK TABLES `roommaster` WRITE;
/*!40000 ALTER TABLE `roommaster` DISABLE KEYS */;
/*!40000 ALTER TABLE `roommaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `section_course`
--

DROP TABLE IF EXISTS `section_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `section_course` (
  `section_id` varchar(5) NOT NULL,
  `course_code` varchar(255) NOT NULL,
  PRIMARY KEY (`section_id`,`course_code`),
  KEY `FKlinoilwu360tyc9y068j1q1cg` (`course_code`),
  CONSTRAINT `FKcfp8nokn9ib0ogcn8ve5nhw9v` FOREIGN KEY (`section_id`) REFERENCES `sectionmaster` (`section_id`),
  CONSTRAINT `FKlinoilwu360tyc9y068j1q1cg` FOREIGN KEY (`course_code`) REFERENCES `coursemaster` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `section_course`
--

LOCK TABLES `section_course` WRITE;
/*!40000 ALTER TABLE `section_course` DISABLE KEYS */;
INSERT INTO `section_course` VALUES ('1','CSE101'),('2','CSE101'),('1','CSE102'),('2','CSE102');
/*!40000 ALTER TABLE `section_course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sectionmaster`
--

DROP TABLE IF EXISTS `sectionmaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sectionmaster` (
  `section_id` varchar(5) NOT NULL,
  `batch` smallint NOT NULL,
  `number_of_groups` smallint NOT NULL,
  `program_code` varchar(9) NOT NULL,
  `program_duration` double NOT NULL,
  `program_name` varchar(12) NOT NULL,
  `program_type` smallint NOT NULL,
  `semester` smallint NOT NULL,
  `strength` smallint NOT NULL,
  `SectionId` varchar(5) NOT NULL,
  `NumberOfGroups` smallint NOT NULL,
  `ProgramCode` varchar(9) NOT NULL,
  `ProgramDuration` double NOT NULL,
  `ProgramName` varchar(12) NOT NULL,
  `ProgramType` smallint NOT NULL,
  PRIMARY KEY (`section_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sectionmaster`
--

LOCK TABLES `sectionmaster` WRITE;
/*!40000 ALTER TABLE `sectionmaster` DISABLE KEYS */;
INSERT INTO `sectionmaster` VALUES ('1',2024,3,'MCA24',2,'MCA',1,1,60,'',0,'',0,'',0),('2',2023,2,'BT23',4,'BTECH',1,3,55,'',0,'',0,'',0),('3',2024,2,'MBA24',2,'MBA',2,1,48,'',0,'',0,'',0),('4',2022,4,'BCA22',3,'BCA',1,5,70,'',0,'',0,'',0);
/*!40000 ALTER TABLE `sectionmaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ticket` (
  `ticket_id` varchar(7) NOT NULL,
  `coursecode` varchar(7) NOT NULL,
  `day` varchar(10) NOT NULL,
  `facultyuid` varchar(5) NOT NULL,
  `group_no` smallint NOT NULL,
  `lecture_no` smallint NOT NULL,
  `merged_code` varchar(7) NOT NULL,
  `room_no` varchar(10) DEFAULT NULL,
  `section` varchar(5) NOT NULL,
  `time` time NOT NULL,
  `TicketId` varchar(7) NOT NULL,
  `GroupNo` smallint NOT NULL,
  `LectureNo` smallint NOT NULL,
  `MergedCode` varchar(7) NOT NULL,
  `RoomNo` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `FK1juhd4xsx0em5kce9qxqoxwqd` (`coursecode`,`group_no`,`section`),
  KEY `FKasdb2c93aseku19dimw9xkidy` (`facultyuid`),
  KEY `FK1bio0o4g6h009pnm9db5v4mk3` (`room_no`),
  CONSTRAINT `FK1bio0o4g6h009pnm9db5v4mk3` FOREIGN KEY (`room_no`) REFERENCES `roommaster` (`room_no`),
  CONSTRAINT `FK1juhd4xsx0em5kce9qxqoxwqd` FOREIGN KEY (`coursecode`, `group_no`, `section`) REFERENCES `coursemapping` (`coursecode`, `group_no`, `section`),
  CONSTRAINT `FKasdb2c93aseku19dimw9xkidy` FOREIGN KEY (`facultyuid`) REFERENCES `facultymaster` (`facultyuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-17 18:57:31
