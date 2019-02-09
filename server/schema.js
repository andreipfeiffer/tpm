/*jshint laxbreak: true*/

var config = require("../config"),
  schema = {};

schema = {
  structure: {},
  populate: {}
};

// @todo should move these 2 somewhere else
// @todo provide an SQL ALTER file
schema.structure.users =
  "" +
  "CREATE TABLE IF NOT EXISTS `users` (" +
  "`id` smallint(5) unsigned NOT NULL AUTO_INCREMENT," +
  "`email` varchar(255) NOT NULL," +
  "`password` varchar(255) NOT NULL," +
  "`sessionID` varchar(64) NOT NULL," +
  "`googleOAuthToken` varchar(128) NOT NULL," +
  "`googleOAuthRefreshToken` varchar(128) NOT NULL," +
  "`googleSelectedCalendar` varchar(128) NOT NULL," +
  "`dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP," +
  "`dateLastActive` timestamp NOT NULL," +
  "`isLogged` tinyint(1) NOT NULL," +
  "`isDeleted` tinyint(1) NOT NULL," +
  "PRIMARY KEY (`id`)," +
  "KEY `isLogged` (`isLogged`)," +
  "KEY `isDeleted` (`isDeleted`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1";

schema.populate.users =
  "" +
  "INSERT INTO `" +
  config.mysql.database +
  "`.`users` (`id`, `email`, `password`, `dateCreated`) VALUES" +
  "  (1, 'asd', 'LT0hfxmHEga78c281577462b86d5359d3e59bea994', '2013-11-25 20:38:39')" +
  ", (2, 'zxc', 'uPkBRcTamG93c639f2f1e260b2bb4b4db082512056', '2013-11-29 23:43:33');";

schema.structure.clients =
  "" +
  "CREATE TABLE IF NOT EXISTS `clients` (" +
  "`id` int(10) unsigned NOT NULL AUTO_INCREMENT," +
  "`idUser` smallint(5) unsigned NOT NULL," +
  "`name` text NOT NULL," +
  "`description` text NOT NULL," +
  "`dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP," +
  "`isDeleted` tinyint(1) NOT NULL," +
  "PRIMARY KEY (`id`)," +
  "KEY `idUser` (`idUser`)," +
  "KEY `isDeleted` (`isDeleted`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1";

schema.populate.clients =
  "" +
  "INSERT INTO `" +
  config.mysql.database +
  "`.`clients` (`id`, `idUser`, `name`) VALUES" +
  "  (1, 1, 'client Ana')" +
  ", (2, 1, 'client Ion')" +
  ", (3, 2, 'client alt user');";

schema.structure.projects =
  "" +
  "CREATE TABLE IF NOT EXISTS `projects` (" +
  "`id` int(10) unsigned NOT NULL AUTO_INCREMENT," +
  "`idUser` smallint(5) unsigned NOT NULL," +
  '`idClient` smallint(5) unsigned NOT NULL DEFAULT "0",' +
  "`name` text NOT NULL," +
  '`status` enum("on hold","started","almost done","finished","paid","cancelled") NOT NULL DEFAULT "on hold",' +
  '`days` tinyint(3) unsigned NOT NULL DEFAULT "0",' +
  '`priceEstimated` smallint(5) unsigned NOT NULL DEFAULT "0",' +
  '`priceFinal` smallint(5) unsigned NOT NULL DEFAULT "0",' +
  "`dateAdded` date NOT NULL," +
  "`dateEstimated` date NULL DEFAULT NULL," +
  "`description` text NOT NULL," +
  "`googleEventId` varchar(64) NOT NULL," +
  '`isDeleted` tinyint(1) NOT NULL DEFAULT "0",' +
  "PRIMARY KEY (`id`)," +
  "KEY `status` (`status`)," +
  "KEY `idUser` (`idUser`)," +
  "KEY `idClient` (`idClient`)," +
  "KEY `isDeleted` (`isDeleted`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";

schema.populate.projects =
  "" +
  "INSERT INTO `" +
  config.mysql.database +
  "`.`projects` (`id`, `idUser`, `idClient`, `name`, `status`, `dateAdded`, `dateEstimated`) VALUES" +
  "  (1, 1, 1, 'Pufosenie roz', 'on hold', '2014-07-23', '2014-12-30')" +
  ", (2, 1, 0, 'Album foto', 'paid', '2014-07-23', '2014-09-12')" +
  ", (3, 1, 2, 'Bratari', 'finished', '2014-07-23', '2014-12-31')" +
  ", (4, 2, 3, 'Proiect alt user', 'on hold', '2014-07-23', '2014-12-30');";

schema.structure["projects_status_log"] =
  "" +
  "CREATE TABLE IF NOT EXISTS `projects_status_log` (" +
  "`idUser` smallint(5) unsigned NOT NULL," +
  "`idProject` int(10) unsigned NOT NULL," +
  "`status` varchar(24) NOT NULL," +
  "`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP," +
  "KEY `idUser` (`idUser`)," +
  "KEY `idProject` (`idProject`)," +
  "KEY `status` (`status`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8";

schema.populate["projects_status_log"] =
  "" +
  "INSERT INTO `" +
  config.mysql.database +
  "`.`projects_status_log` (`idUser`, `idProject`, `status`, `date`) VALUES" +
  "  (1, 1, 'on hold', '2014-07-23 16:58:56')" +
  ", (1, 2, 'started', '2014-08-23 17:58:56')" +
  ", (1, 2, 'finished',    '2014-12-23 17:58:56')" +
  // because this is set to the first day of month
  // reports should set it to the previous month
  ", (1, 2, 'paid',        '2015-02-01 17:58:56')" +
  ", (1, 3, 'on hold',  '2014-09-23 18:58:56')" +
  ", (1, 3, 'paid',     '2014-10-23 18:58:56')" +
  ", (1, 3, 'finished', '2014-11-23 18:58:56')" +
  ", (2, 4, 'on hold', '2014-09-26 19:58:56');";

schema.structure["error_log"] =
  "" +
  "CREATE TABLE IF NOT EXISTS `error_log` (" +
  "`idUser` smallint(5) unsigned NOT NULL," +
  "`source` varchar(32) NOT NULL," +
  "`data` text NOT NULL," +
  "`error` text NOT NULL," +
  "`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP," +
  "KEY `idUser` (`idUser`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8";

schema.structure.settings =
  "" +
  "CREATE TABLE IF NOT EXISTS `settings` (" +
  "`idUser` smallint(5) unsigned NOT NULL," +
  '`currency` varchar(10) NOT NULL DEFAULT "ron",' +
  "KEY `idUser` (`idUser`)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8";

module.exports = schema;
