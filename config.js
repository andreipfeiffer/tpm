/*jshint laxbreak: true*/

var config = {};

config.mysql = {};
config.web = {};

config.web.port = process.env.PORT || 3000;

config.mysql.host = 'localhost';
config.mysql.user = 'root';
config.mysql.password = '';
config.mysql.database = 'tpm';
config.mysql.structure = {};
config.mysql.populate = {};

// @todo should move these 2 somewhere else
// @todo provide an MySQL ALTER file
config.mysql.structure.todos = ''
	+ 'CREATE TABLE IF NOT EXISTS `todos` ('
	+     '`id` int(11) NOT NULL AUTO_INCREMENT,'
	+     '`idUser` smallint(6) NOT NULL,'
	+     '`title` text NOT NULL,'
	+     '`isCompleted` tinyint(1) NOT NULL,'
	+     'PRIMARY KEY (`id`),'
	+     'KEY `isCompleted` (`isCompleted`),'
	+     'KEY `idUser` (`idUser`)'
	+ ') ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1';

config.mysql.populate.todos = ''
	+ 'INSERT INTO `' + config.mysql.database + '`.`todos` (`id`, `idUser`, `title`, `isCompleted`) VALUES'
	+ '  (1, 1, \'Learn Ember\', 0)'
	+ ', (2, 1, \'Build an API in Express\', 1)'
	+ ', (3, 1, \'Create a persistence layer with MySQL\', 1)'
	+ ', (4, 1, \'Develop calendar app for Lia\', 0)'
	+ ', (5, 2, \'The other user task\', 0);';

config.mysql.structure.users = ''
	+ 'CREATE TABLE IF NOT EXISTS `users` ('
	+     '`id` int(11) NOT NULL AUTO_INCREMENT,'
	+     '`email` varchar(255) NOT NULL,'
	+     '`password` varchar(255) NOT NULL,'
	+     '`authToken` varchar(64) NOT NULL,'
	+     '`dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,'
	+     'PRIMARY KEY (`id`),'
	+     'KEY `authToken` (`authToken`)'
	+ ') ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1';

config.mysql.populate.users = ''
	+ 'INSERT INTO `' + config.mysql.database + '`.`users` (`id`, `email`, `password`, `dateCreated`) VALUES'
	+ '  (1, \'asd@asd.asd\', \'LT0hfxmHEga78c281577462b86d5359d3e59bea994\', \'2013-11-25 20:38:39\')'
	+ ', (2, \'zxc@zxc.zxc\', \'uPkBRcTamG93c639f2f1e260b2bb4b4db082512056\', \'2013-11-29 23:43:33\');';

module.exports = config;