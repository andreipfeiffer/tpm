var TPM = TPM || {};

(function() {

    TPM.mocks = {

        projectsList: [
            {
                "id": 1,
                "idUser": 1,
                "idClient": 1,
                "name": "Pufosenie roz",
                "status": "on hold",
                "price": 0,
                "dateAdded": "2014-07-22T21:00:00.000Z",
                "dateEstimated": "2014-12-29T22:00:00.000Z"
            },
            {
                "id": 2,
                "idUser": 1,
                "idClient": 0,
                "name": "Album foto",
                "status": "in progress",
                "price": 20,
                "dateAdded": "2014-07-22T21:00:00.000Z",
                "dateEstimated": "2014-09-11T21:00:00.000Z"
            }
        ],

        clientsList: [
            {
                "id": 1,
                "idUser": 1,
                "name": "client Ana",
                "dateCreated": "2014-07-14T19:10:55.000Z",
                "nrProjects": 2
            },
            {
                "id": 2,
                "idUser": 1,
                "name": "client Ion",
                "dateCreated": "2014-07-14T19:10:55.000Z",
                "nrProjects": 1
            }
        ]

    };

}());
