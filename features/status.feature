Feature: Status

    Scenario: Getting logged out while on status page, should keep you on the page, but remove the menu
        Given I am logged in
            And I am on the "status" page
        When I get logged out
            And I navigate to "status" page
        Then I should be redirected to "status" page
            And The menu bar should not be visible
