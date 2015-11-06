Feature: User authentication
    As a regular user
    I want to login into the application

    Scenario: Failed login
        Given I am on the "login" page
            And I am not logged in
        When I enter incorrect credentials
            And I submit the login form
        Then an error message should display

    Scenario: Successfull login
        Given I am on the "login" page
            And I am not logged in
        When I enter correct credentials
            And I submit the login form
        Then I should be redirected to "projects" page
