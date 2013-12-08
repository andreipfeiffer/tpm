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
// @todo provide an SQL ALTER file
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
    + '  (1, \'asd\', \'LT0hfxmHEga78c281577462b86d5359d3e59bea994\', \'2013-11-25 20:38:39\')'
    + ', (2, \'zxc\', \'uPkBRcTamG93c639f2f1e260b2bb4b4db082512056\', \'2013-11-29 23:43:33\');';

config.mysql.structure.clients = ''
    + 'CREATE TABLE IF NOT EXISTS `clients` ('
    +     '`id` int(11) NOT NULL AUTO_INCREMENT,'
    +     '`idUser` smallint(6) NOT NULL,'
    +     '`name` text NOT NULL,'
    +     '`dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,'
    +     'PRIMARY KEY (`id`),'
    +     'KEY `idUser` (`idUser`)'
    + ') ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1';

config.mysql.populate.clients = ''
    + 'INSERT INTO `' + config.mysql.database + '`.`clients` (`id`, `idUser`, `name`) VALUES'
    + '  (1, 1, \'client Ana\')'
    + ', (2, 1, \'client Ion\')'
    + ', (3, 2, \'client alt user\');';

config.mysql.structure.projects = ''
    + 'CREATE TABLE IF NOT EXISTS `projects` ('
    +     '`id` int(11) NOT NULL AUTO_INCREMENT,'
    +     '`idUser` smallint(6) NOT NULL,'
    +     '`idClient` smallint(6) NOT NULL,'
    +     '`name` text NOT NULL,'
    +     '`isCompleted` tinyint(1) NOT NULL,'
    +     'PRIMARY KEY (`id`),'
    +     'KEY `isCompleted` (`isCompleted`),'
    +     'KEY `idUser` (`idUser`),'
    +     'KEY `idClient` (`idClient`)'
    + ') ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1';

config.mysql.populate.projects = ''
    + 'INSERT INTO `' + config.mysql.database + '`.`projects` (`id`, `idUser`, `idClient`, `name`, `isCompleted`) VALUES'
    + '  (1, 1, 1, \'Pufosenie roz\', 0)'
    + ', (2, 1, 1, \'Album foto\', 0)'
    + ', (3, 1, 2, \'Bratari\', 0)'
    + ', (4, 2, 3, \'Proiect alt user\', 0);';

module.exports = config;