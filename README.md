# ISTE-432-Admin

Designed and developed by: Jordan Rabideau, Ryan Beach, Steffen Barr<br>
Instructor: Stephen Zilora<br>
ISTE-432 Database Application Development<br>

## Pages:

- index.html -> Admin users can log in via the admin portal, provided they have been designated the admin role.
- manager.html ->Users have the ability to view existing societies or create new ones. Similarly, existing campaigns can be viewed, managed, or toggled active/inactive. Users also have the ability to create new campaigns from here.
- campaign.html -> The current results and start/end times of a given campaign can be viewed, as can the results of a range of ballots, designated by the ID of the ballots. Additionally, paper ballots can be submitted via CSV.
- society.html -> Users can view the count of members currently a part of a given society, along with existing campaigns, their vote count, along with their results. Users can also modify a given campaign.
- create-campaign.html -> This page allows for the creation of a campaign, the designation of start and end dates for the campaign, and the implementation of questions and choices/candidates with titles and descriptions for each.
- create-society.html -> This page allows for the creation of a society, implementation of members via CSV, and designation of authentication types for users/voters to log in with.
- edit-campaign.html -> This page allows the user to select a given campaign and modify elements such as the questions, choices, and start/end dates of the campaign.

## Assets:

Style sheets for all interfaces of the application and JavaScript files for each above mentioned page.

## How to use:

Using the index.html page, log in using administrator credentials. Upon successful authentication, you will be redirected to the manager.html page where you may modify, create, and view societies and campaigns. Viewing a society or campaign will redirect you to society.html or campaign.html respectively. Each page provides information on its respective subject, socety will provide member count, active campaigns, and vote count, while campaign will provide results, range selection, and paper ballot submission for a given campaign. Modifying a campaign will redirect you to edit-campaign.html where you may change elements, values, and dates on a given campaign. Creating a society or campaign will redirect you to create-society.html or create-campaign.html respectively. Each allow the user to submit new entries for a society or a campaign.
