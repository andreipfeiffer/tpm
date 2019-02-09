import angular from "angular";

export default angular
  .module("TPM.Directives", [])

  .directive("setFocus", () => {
    return {
      restrict: "A",
      link(scope, element) {
        var $elem = $(element[0]);

        // attempt to set focus
        $elem.focus();

        // need this second attempt for modals
        if (!$elem.is(":focus")) {
          setTimeout(() => $elem.focus(), 50);
        }
      }
    };
  })

  .directive("clickConfirm", [
    "$uibModal",
    "$parse",
    ($modal, $parse) => {
      return {
        restrict: "A",
        link(scope, element, attrs) {
          var modalInstance, clickHandler;

          element.bind("click", () => {
            modalInstance = $modal.open({
              templateUrl: "public/views/modal-confirm.html",
              controller: [
                "$scope",
                $scope => {
                  $scope.message = attrs.clickConfirmMessage;
                }
              ]
            });

            modalInstance.result.then(
              () => {
                // close callback
              },
              () => {
                // dismiss callback

                clickHandler = $parse(attrs.clickConfirm);
                // Run the function returned by $parse.
                // It needs the scope object to operate properly.
                clickHandler(scope);
              }
            );
          });
        }
      };
    }
  ]);
