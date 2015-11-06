module.exports = function(knex) {

    'use strict';

    function getProjectsReport(idUser) {
        var q = '';

        q += 'SELECT';
        q += ' projects.id,';
        q += ' idClient,';
        q += ' projects.name,';
        q += ' clients.name AS clientName,';
        q += ' priceEstimated,';
        q += ' priceFinal,';
        q += ' date,';
        q += ' projects.status,';
        q += ' CONCAT(YEAR(filtered_projects.date), "-" , MONTH(filtered_projects.date)) AS month';

        q += ' FROM (SELECT date, idProject FROM projects_status_log WHERE idUser='+idUser+' AND status IN ("paid", "finished") ORDER BY date DESC)';
        q += ' AS filtered_projects';

        q += ' LEFT JOIN projects';
        q += ' ON filtered_projects.idProject = projects.id';

        q += ' LEFT JOIN clients';
        q += ' ON projects.idClient = clients.id';

        q += ' WHERE projects.isDeleted = 0';
        q += ' GROUP BY filtered_projects.idProject';
        q += ' ORDER BY filtered_projects.date DESC';

        return knex.raw( q );
    }

    return {
        getAll: function(req, res) {
            var userLogged = req.user;

            getProjectsReport( userLogged.id ).then(function(data) {
                // don't know why it returns 2 arrays
                // (probably because of the 2 selects in the query)
                var projects = data[0];

                return res.send( projects );
            });
        }
    };

};
