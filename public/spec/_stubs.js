export default {
  projectsList: [
    {
      id: 1,
      idUser: 1,
      idClient: 1,
      name: "Pufosenie roz",
      status: "on hold",
      price: 0,
      dateAdded: "2014-07-22T21:00:00.000Z",
      dateEstimated: "2014-12-29T22:00:00.000Z"
    },
    {
      id: 2,
      idUser: 1,
      idClient: 0,
      name: "Album foto",
      status: "started",
      price: 20,
      dateAdded: "2014-07-22T21:00:00.000Z",
      dateEstimated: "2014-09-11T21:00:00.000Z"
    },
    {
      id: 3,
      idUser: 1,
      idClient: 2,
      name: "Bratari duble",
      status: "started",
      price: 100,
      dateAdded: "2014-07-22T21:00:00.000Z",
      dateEstimated: "2014-09-11T21:00:00.000Z"
    }
  ],

  clientsList: [
    {
      id: 1,
      idUser: 1,
      name: "client Ana",
      dateCreated: "2014-07-14T19:10:55.000Z",
      nrProjects: 2
    },
    {
      id: 2,
      idUser: 1,
      name: "client Ion",
      dateCreated: "2014-07-14T19:10:55.000Z",
      nrProjects: 1
    }
  ],

  reports: {
    // these come sorted chronologically
    byMonth: [
      { month: "2018-01", count: 1, total: 100 },
      { month: "2019-01", count: 2, total: 200 }
    ],
    // these come sorted desc by total
    totalByClient: [
      {
        id: 2,
        count: 2,
        name: "client 2",
        total: 200
      },
      {
        id: 1,
        count: 1,
        name: "client 1",
        total: 100
      }
    ],
    clientsByCount: []
  },

  fakeModal: {
    result: {
      then: (confirmCallback /*, cancelCallback*/) => {
        // Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
        // this.confirmCallBack = confirmCallback;
        // this.cancelCallback  = cancelCallback;
        confirmCallback();
      }
    },
    opened: {
      then: confirmCallback => {
        // this.confirmCallBack = confirmCallback;
        confirmCallback();
      }
    }
    /*close(item) {
            // The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
            // this.result.confirmCallBack( item );
        },
        dismiss(type) {
            // The user clicked cancel on the modal dialog, call the stored cancel callback
            // this.result.cancelCallback( type );
        }*/
  }
};
