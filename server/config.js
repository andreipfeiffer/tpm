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
    +     '`id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,'
    +     '`email` varchar(255) NOT NULL,'
    +     '`password` varchar(255) NOT NULL,'
    +     '`authToken` varchar(64) NOT NULL,'
    +     '`dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,'
    +     '`isDeleted` tinyint(1) NOT NULL,'
    +     'PRIMARY KEY (`id`),'
    +     'KEY `authToken` (`authToken`),'
    +     'KEY `isDeleted` (`isDeleted`)'
    + ') ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1';

config.mysql.populate.users = ''
    + 'INSERT INTO `' + config.mysql.database + '`.`users` (`id`, `email`, `password`, `dateCreated`) VALUES'
    + '  (1, \'asd\', \'LT0hfxmHEga78c281577462b86d5359d3e59bea994\', \'2013-11-25 20:38:39\')'
    + ', (2, \'zxc\', \'uPkBRcTamG93c639f2f1e260b2bb4b4db082512056\', \'2013-11-29 23:43:33\');';

config.mysql.structure.clients = ''
    + 'CREATE TABLE IF NOT EXISTS `clients` ('
    +     '`id` int(10) unsigned NOT NULL AUTO_INCREMENT,'
    +     '`idUser` smallint(5) unsigned NOT NULL,'
    +     '`name` text NOT NULL,'
    +     '`description` text NOT NULL,'
    +     '`dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,'
    +     '`isDeleted` tinyint(1) NOT NULL,'
    +     'PRIMARY KEY (`id`),'
    +     'KEY `idUser` (`idUser`),'
    +     'KEY `isDeleted` (`isDeleted`)'
    + ') ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1';

config.mysql.populate.clients = ''
    + 'INSERT INTO `' + config.mysql.database + '`.`clients` (`id`, `idUser`, `name`) VALUES'
    + '  (1, 1, \'client Ana\')'
    + ', (2, 1, \'client Ion\')'
    + ', (3, 2, \'client alt user\');';

config.mysql.structure.projects = ''
    + 'CREATE TABLE IF NOT EXISTS `projects` ('
    +     '`id` int(10) unsigned NOT NULL AUTO_INCREMENT,'
    +     '`idUser` smallint(5) unsigned NOT NULL,'
    +     '`idClient` smallint(5) unsigned NOT NULL DEFAULT "0",'
    +     '`name` text NOT NULL,'
    +     '`status` enum("on hold","in progress","finished","payed") NOT NULL DEFAULT "on hold",'
    +     '`days` tinyint(3) unsigned NOT NULL,'
    +     '`priceEstimated` smallint(5) unsigned NOT NULL DEFAULT "0",'
    +     '`priceFinal` smallint(5) unsigned NOT NULL DEFAULT "0",'
    +     '`dateAdded` date NOT NULL,'
    +     '`dateEstimated` date NOT NULL,'
    +     '`description` text NOT NULL,'
    +     '`isDeleted` tinyint(1) NOT NULL,'
    +     'PRIMARY KEY (`id`),'
    +     'KEY `status` (`status`),'
    +     'KEY `idUser` (`idUser`),'
    +     'KEY `idClient` (`idClient`),'
    +     'KEY `isDeleted` (`isDeleted`)'
    + ') ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1';

config.mysql.populate.projects = ''
    + 'INSERT INTO `' + config.mysql.database + '`.`projects` (`id`, `idUser`, `idClient`, `name`, `status`, `dateAdded`, `dateEstimated`) VALUES'
    + '  (1, 1, 1, \'Pufosenie roz\', \'on hold\', \'2014-07-23\', \'2014-12-30\')'
    + ', (2, 1, 0, \'Album foto\', \'in progress\', \'2014-07-23\', \'2014-09-12\')'
    + ', (3, 1, 2, \'Bratari\', \'on hold\', \'2014-07-23\', \'2014-12-31\')'
    + ', (4, 2, 3, \'Proiect alt user\', \'on hold\', \'2014-07-23\', \'2014-12-30\');';

config.mysql.structure['projects_status_log'] = ''
    + 'CREATE TABLE IF NOT EXISTS `projects_status_log` ('
    +     '`idUser` smallint(5) unsigned NOT NULL,'
    +     '`idProject` int(10) unsigned NOT NULL,'
    +     '`oldStatus` varchar(24) NOT NULL,'
    +     '`status` varchar(24) NOT NULL,'
    +     '`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,'
    +     'KEY `idUser` (`idUser`),'
    +     'KEY `idProject` (`idProject`)'
    + ') ENGINE=InnoDB DEFAULT CHARSET=utf8';

module.exports = config;
