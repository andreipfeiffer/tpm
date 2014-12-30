ALTER TABLE `users` DROP INDEX `authToken`;
ALTER TABLE `users` DROP `authToken`;
ALTER TABLE `users` ADD  `isLogged` TINYINT( 1 ) NOT NULL AFTER  `dateCreated`, ADD INDEX (  `isLogged` );