var TPM = TPM || {};

(function() {

    TPM.mocks = {

        projectsList: [
            {
                "id"           : 1,
                "idUser"       : 1,
                "idClient"     : 1,
                "name"         : "Pufosenie roz",
                "status"       : "on hold",
                "price"        : 0,
                "dateAdded"    : "2014-07-22T21:00:00.000Z",
                "dateEstimated": "2014-12-29T22:00:00.000Z"
            },
            {
                "id"           : 2,
                "idUser"       : 1,
                "idClient"     : 0,
                "name"         : "Album foto",
                "status"       : "in progress",
                "price"        : 20,
                "dateAdded"    : "2014-07-22T21:00:00.000Z",
                "dateEstimated": "2014-09-11T21:00:00.000Z"
            },
            {
                "id"           : 3,
                "idUser"       : 1,
                "idClient"     : 2,
                "name"         : "Bratari duble",
                "status"       : "in progress",
                "price"        : 100,
                "dateAdded"    : "2014-07-22T21:00:00.000Z",
                "dateEstimated": "2014-09-11T21:00:00.000Z"
            }
        ],

        clientsList: [
            {
                "id"         : 1,
                "idUser"     : 1,
                "name"       : "client Ana",
                "dateCreated": "2014-07-14T19:10:55.000Z",
                "nrProjects" : 2
            },
            {
                "id"         : 2,
                "idUser"     : 1,
                "name"       : "client Ion",
                "dateCreated": "2014-07-14T19:10:55.000Z",
                "nrProjects" : 1
            }
        ],

        reports: [
            // used to calculate "finished, not paid"
            {
                "id"            : 1,
                "idClient"      : 1,
                "name"          : "Proiect 1",
                "clientName"    : "client A",
                "priceEstimated": 110,
                "priceFinal"    : 220,
                "date"          : "2015-01-10T08:51:06.000Z",
                "status"        : "finished",
                "month"         : "2015-1"
            },
            {
                "id"            : 2,
                "idClient"      : 2,
                "name"          : "Proiect 2",
                "clientName"    : "client B",
                "priceEstimated": 100,
                "priceFinal"    : 0,
                "date"          : "2014-11-10T08:51:06.000Z",
                "status"        : "finished",
                "month"         : "2014-11"
            },

            // "2015"
            {
                "id"            : 3,
                "idClient"      : 1,
                "name"          : "Proiect 3",
                "clientName"    : "client A",
                "priceEstimated": 0,
                "priceFinal"    : 100,
                "date"          : "2015-01-12T08:51:06.000Z",
                "status"        : "paid",
                "month"         : "2015-1"
            },
            {
                "id"            : 4,
                "idClient"      : 1,
                "name"          : "Proiect 4",
                "clientName"    : "client A",
                "priceEstimated": 200,
                "priceFinal"    : 0,
                "date"          : "2015-01-10T08:51:06.000Z",
                "status"        : "paid",
                "month"         : "2015-1"
            },

            // "2014"
            {
                "id"            : 5,
                "idClient"      : 1,
                "name"          : "Proiect 5",
                "clientName"    : "client A",
                "priceEstimated": 100,
                "priceFinal"    : 200,
                "date"          : "2014-12-12T08:51:06.000Z",
                "status"        : "paid",
                "month"         : "2014-12"
            },
            {
                "id"            : 6,
                "idClient"      : 2,
                "name"          : "Proiect 6",
                "clientName"    : "client B",
                "priceEstimated": 3000,
                "priceFinal"    : 2500,
                "date"          : "2014-12-10T08:51:06.000Z",
                "status"        : "paid",
                "month"         : "2014-12"
            }
        ]

    };

}());
