var TPM = TPM || {};

(function() {

    TPM.mocks = {

        projectsList: [
            {
                "id": 1,
                "idUser": 1,
                "idClient": 1,
                "name": "Pufosenie roz",
                "isCompleted": ""
            },
            {
                "id": 2,
                "idUser": 1,
                "idClient": 0,
                "name": "Album foto",
                "isCompleted": ""
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
