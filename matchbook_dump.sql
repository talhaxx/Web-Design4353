-- MySQL dump 10.13  Distrib 9.2.0, for macos15 (arm64)
--
-- Host: localhost    Database: MatchbookDB
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

USE MatchbookDB;


--
-- Table structure for table `EventDetails`
--

DROP TABLE IF EXISTS `EventDetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EventDetails` (
  `EventID` int NOT NULL AUTO_INCREMENT,
  `EventName` varchar(255) NOT NULL,
  `Description` text,
  `Location` varchar(255) DEFAULT NULL,
  `RequiredSkills` text,
  `Urgency` int DEFAULT NULL,
  `EventDate` date DEFAULT NULL,
  PRIMARY KEY (`EventID`),
  CONSTRAINT `eventdetails_chk_1` CHECK ((`Urgency` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EventDetails`
--

LOCK TABLES `EventDetails` WRITE;
/*!40000 ALTER TABLE `EventDetails` DISABLE KEYS */;
INSERT INTO `EventDetails` VALUES 
(1,'Food Drive 2023','Community food drive to collect non-perishable items for local food banks.','Community Center, Downtown','Logistics, Driving, Event Planning',3,'2023-12-15'),
(2,'Habitat Build Project','Constructing affordable housing for families in need.','1234 Construction Site, North District','Construction, First Aid, Logistics',4,'2023-12-20'),
(3,'Senior Care Visit','Providing companionship and assistance to elderly residents.','Sunny Pines Retirement Home','Medical, Cooking, Administration',2,'2023-12-10'),
(4,'Youth Mentorship Program','Mentoring at-risk youth through educational and recreational activities.','City Youth Center','Teaching, Event Planning, Administration',3,'2024-01-05'),
(5,'Disaster Relief Training','Training session for volunteers to prepare for emergency response.','Fire Station #5','First Aid, Logistics, Medical',5,'2023-12-05');
/*!40000 ALTER TABLE `EventDetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `States`
--

DROP TABLE IF EXISTS `States`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `States` (
  `StateCode` char(2) NOT NULL,
  `StateName` varchar(50) NOT NULL,
  PRIMARY KEY (`StateCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `States`
--

LOCK TABLES `States` WRITE;
/*!40000 ALTER TABLE `States` DISABLE KEYS */;
INSERT INTO `States` VALUES 
('AL','Alabama'),
('AK','Alaska'),
('AZ','Arizona'),
('AR','Arkansas'),
('CA','California'),
('CO','Colorado'),
('CT','Connecticut'),
('DE','Delaware'),
('FL','Florida'),
('GA','Georgia'),
('HI','Hawaii'),
('ID','Idaho'),
('IL','Illinois'),
('IN','Indiana'),
('IA','Iowa'),
('KS','Kansas'),
('KY','Kentucky'),
('LA','Louisiana'),
('ME','Maine'),
('MD','Maryland'),
('MA','Massachusetts'),
('MI','Michigan'),
('MN','Minnesota'),
('MS','Mississippi'),
('MO','Missouri'),
('MT','Montana'),
('NE','Nebraska'),
('NV','Nevada'),
('NH','New Hampshire'),
('NJ','New Jersey'),
('NM','New Mexico'),
('NY','New York'),
('NC','North Carolina'),
('ND','North Dakota'),
('OH','Ohio'),
('OK','Oklahoma'),
('OR','Oregon'),
('PA','Pennsylvania'),
('RI','Rhode Island'),
('SC','South Carolina'),
('SD','South Dakota'),
('TN','Tennessee'),
('TX','Texas'),
('UT','Utah'),
('VT','Vermont'),
('VA','Virginia'),
('WA','Washington'),
('WV','West Virginia'),
('WI','Wisconsin'),
('WY','Wyoming'),
('DC','District of Columbia');
/*!40000 ALTER TABLE `States` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserCredentials`
--

DROP TABLE IF EXISTS `UserCredentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserCredentials` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserCredentials`
--

LOCK TABLES `UserCredentials` WRITE;
/*!40000 ALTER TABLE `UserCredentials` DISABLE KEYS */;
-- Admin user and volunteers with hashed passwords
INSERT INTO `UserCredentials` VALUES 
(1,'john@example.com','$2b$10$LCXUm2VkFLK8b9uxAEuTaeqB1.4FJzxVsDl7q52YvPrK3r.nUroYK'),
(2,'admin@matchbook.com','$2b$10$T4/4B7ybC5YKvYBakXMEgen.7T3QtIOvd6WhMMIFqKUMEdGMjpm3u'),
(3,'jane@example.com','$2b$10$uTYGAh.FLeAcmVQ/JLXhMu2SfHuDOiMrSfmLtSlNdDAYupXYK61kW'),
(4,'robert@example.com','$2b$10$Cf7eHHUHJ9sQzsZ0ELAi0eMKCzjlJZyWcpMBKOBNfzl5mS.WVv6dG'),
(5,'sarah@example.com','$2b$10$QpgNBHWYFzZC6/YlT0Ei4e.Cs667WNRd5YoR0a4QZ6HUO1.gGq3YW'),
(6,'michael@example.com','$2b$10$hXnDcqIw/YP8KLKdh9bk7OMVPm/JQzxmmZfDpbwbXeIY.x4mTT3cC');
/*!40000 ALTER TABLE `UserCredentials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserProfile`
--

DROP TABLE IF EXISTS `UserProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserProfile` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `FullName` varchar(100) NOT NULL,
  `Address` text NOT NULL,
  `City` varchar(50) NOT NULL,
  `State` char(2) NOT NULL,
  `Zipcode` varchar(10) NOT NULL,
  `Skills` text NOT NULL,
  `Preferences` text,
  `Availability` text NOT NULL,
  `IsAdmin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UserID` (`UserID`),
  CONSTRAINT `userprofile_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UserCredentials` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserProfile`
--

LOCK TABLES `UserProfile` WRITE;
/*!40000 ALTER TABLE `UserProfile` DISABLE KEYS */;
-- Admin and volunteer profiles with matching skills to events
INSERT INTO `UserProfile` VALUES 
(1,1,'John Doe','123 Elm St','New York','NY','10001','First Aid, Cooking, Driving','Outdoor','["2023-05-15","2023-05-16","2023-05-17","2023-12-15","2023-12-20"]',0),
(2,2,'Admin User','Admin Office','Houston','TX','77001','Administration, Logistics, Event Planning','Management','["2023-05-15","2023-05-16","2023-05-17","2023-05-18","2023-05-19","2023-12-15"]',1),
(3,3,'Jane Smith','456 Oak Ave','Los Angeles','CA','90001','Languages, Teaching, Organizing, Event Planning','Education','["2023-06-20","2023-06-21","2023-12-10","2024-01-05"]',0),
(4,4,'Robert Johnson','789 Pine Blvd','Chicago','IL','60007','Medical, IT Support, Construction, First Aid','Healthcare','["2023-04-10","2023-04-11","2023-12-05","2023-12-20"]',0),
(5,5,'Sarah Williams','321 Cedar Lane','Houston','TX','77002','Counseling, Leadership, Event Planning, Teaching','Youth Services','["2023-07-05","2023-07-06","2024-01-05"]',0),
(6,6,'Michael Brown','654 Birch Dr','Phoenix','AZ','85001','Fundraising, Communication, Sports, Logistics','Sports','["2023-03-25","2023-03-26","2023-12-15"]',0);
/*!40000 ALTER TABLE `UserProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VolunteerHistory`
--

DROP TABLE IF EXISTS `VolunteerHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VolunteerHistory` (
  `VolunteerID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `EventID` int DEFAULT NULL,
  `ParticipationDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`VolunteerID`),
  KEY `UserID` (`UserID`),
  KEY `EventID` (`EventID`),
  CONSTRAINT `volunteerhistory_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UserProfile` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `volunteerhistory_ibfk_2` FOREIGN KEY (`EventID`) REFERENCES `EventDetails` (`EventID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VolunteerHistory`
--

LOCK TABLES `VolunteerHistory` WRITE;
/*!40000 ALTER TABLE `VolunteerHistory` DISABLE KEYS */;
INSERT INTO `VolunteerHistory` VALUES 
(1,1,1,'2023-12-15 14:28:07'),
(2,2,1,'2023-12-15 15:30:10'),
(3,4,2,'2023-12-20 09:15:22'),
(4,3,3,'2023-12-10 10:45:33'),
(5,5,4,'2024-01-05 13:20:45'),
(6,6,1,'2023-12-15 08:55:16');
/*!40000 ALTER TABLE `VolunteerHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `NotificationID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`NotificationID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UserCredentials` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-21 19:59:28
