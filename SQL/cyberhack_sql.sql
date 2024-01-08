use cyberhack_database;
/* table creation */
DROP TABLE IF EXISTS `job_application`;
CREATE TABLE `job_application` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `job_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `resume` varchar(250) DEFAULT NULL,
  `status` varchar(250) DEFAULT NULL,
  `provider_id` int DEFAULT NULL,
  `is_deleted` int DEFAULT NULL,
  PRIMARY KEY (`application_id`)
);

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `job_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `category` varchar(55) DEFAULT NULL,
  `start_date` varchar(55) DEFAULT NULL,
  `end_date` varchar(55) DEFAULT NULL,
  `provider_id` int DEFAULT NULL,
  `is_deleted` int DEFAULT NULL,
  PRIMARY KEY (`job_id`)
);

DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `post_header` varchar(255) NOT NULL,
  `post_body` varchar(2000) NOT NULL,
  PRIMARY KEY (`post_id`)
);

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(255) NOT NULL,
  PRIMARY KEY (`role_id`)
);

DROP TABLE IF EXISTS `userRoles`;
CREATE TABLE `userRoles` (
  `user_roles_id` int NOT NULL AUTO_INCREMENT,
  `role_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `is_active` int NOT NULL,
  PRIMARY KEY (`user_roles_id`)
);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` int NOT NULL,
  PRIMARY KEY (`user_id`)
);
/*****************/

/* run below command */
drop table if exists `user_details`;
drop table if exists `userposts`;
truncate table job_application;
truncate table jobs;
truncate table posts;
truncate table roles;
truncate table userroles;
truncate table users;

/* insert roles in roles table */
insert into roles(role_name) values('admin');
insert into roles(role_name) values('cyber_security_expert');
insert into roles(role_name) values('ngo');
commit;

/* insert jobs in jobs table */
insert into jobs(title, description, category, start_date, end_date, provider_id, is_deleted)
values('softawre tester','This jobs is to test the software of NGO webapplication','Software Dveloper','2023-10-01','2024-10-02','9', '0');
insert into jobs(title, description, category, start_date, end_date, provider_id, is_deleted)
values('vulnerability tester','this jobs is to test the vulnerability of NGO webapplication','Cyber Security Engineer','2023-10-01','2024-10-02','9', '0');
insert into jobs(title, description, category, start_date, end_date, provider_id, is_deleted)
values('Techincal and Hardware Engineer','this jobs is to test the vulnerability of NGO webapplication','Techincal and Hardware Engineer','2023-10-01','2024-10-02','9', '0');
insert into jobs(title, description, category, start_date, end_date, provider_id, is_deleted)
values('Penetration Test Engineer','this jobs is to test the vulnerability of NGO webapplication','Penetration Test Engineer','2023-10-01','2024-10-02','9', '0');
insert into jobs(title, description, category, start_date, end_date, provider_id, is_deleted)
values('software developer III','this jobs is to test the vulnerability of NGO webapplication','Penetration Test Engineer','2023-10-01','2024-10-02','9', '0');
insert into jobs(title, description, category, start_date, end_date, provider_id, is_deleted)
values('white hat hacker','this jobs is to test the vulnerability of NGO webapplication','Cyber Security Engineer','2023-10-01','2024-10-02','9', '0');
insert into jobs(title, description, category, start_date, end_date, provider_id, is_deleted)
values('penetrating tester','this jobs is to test the vulnerability of NGO webapplication','Cyber Security Engineer','2023-10-01','2024-10-02','9', '0');
commit;

/* create 3 users */
/* 1st user */
/* signup as a new user and select role as 'cyber_security_expert' run below query */
update userroles set role_id=1 where user_id = (select user_id from users where is_active=1);
commit;

/* 1st user */
/* signup again as a new user and select role as 'cyber_security_expert' run below query */

/* 1st user */
/* signup again as a new user and select role as 'ngo' run below query */