Feature: Projects

    Scenario: Add projects form disabled if title has less than 3 characters
        Given I am logged in
            And I am on the "projects/new" page
        When I type "12" as the title
        Then Project form should be disabled

    Scenario: Add projects form enabled when title has 3 characters
        Given I am logged in
            And I am on the "projects/new" page
        When I type "123" as the title
        Then Project form should be enabled
