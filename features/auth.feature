Feature: User authentication
    As a regular user
    I want to login into the application

    Scenario: Successfull login
        Given I am on the "login" page
            And I am not logged in
        When I enter correct credentials
            And I submit the login form
        Then I should be redirected to "projects" page

    Scenario: Failed login
        Given I am on the "login" page
            And I am not logged in
        When I enter incorrect credentials
            And I submit the login form
        Then an error message should display
            And the message should read "Bad username or password"

    Scenario: Logout
        Given I am logged in
        When I logout
        Then I should be redirected to "login" page
