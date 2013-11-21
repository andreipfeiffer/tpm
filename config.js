var config = {}

config.mysql = {};
config.web = {};

config.web.port = process.env.PORT || 3000;

config.mysql.host = 'localhost';
config.mysql.user = 'root';
config.mysql.password = '';
config.mysql.database = 'tpm';

// @todo should move these 2 somewhere else
// @todo provide an MySQL ALTER file
config.mysql.structure = ''
	+ 'CREATE TABLE IF NOT EXISTS `todos` ('
	+     '`id` int(11) NOT NULL AUTO_INCREMENT,'
	+     '`title` text NOT NULL,'
	+     '`isCompleted` tinyint(1) NOT NULL,'
	+     'PRIMARY KEY (`id`),'
	+     'KEY `isCompleted` (`isCompleted`)'
	+ ') ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1';

config.mysql.populate = ''
	+ 'INSERT INTO `' + config.mysql.database + '`.`todos` (`title`) VALUES (\'Learn Ember\')'
	+ ', (\'Build an API in Express\')'
	+ ', (\'Create a persistence layer with MySQL\')'
	+ ', (\'Develop calendar app for Lia\');';

module.exports = config;