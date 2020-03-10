# Toggl to Deltek

NodeJS script which automatically fills out a [Deltek Vision Timesheet](https://www.deltek.com/en/products/project-erp/vision) from time entries in [Toggl](https://toggl.com/)

Deltek projects are identfied by matching the client of each Toggl project to project number in Deltek. 

Client names must match the following format: `XXXXXX-000-00-0000`

Alternatively, client names can be suffixed with the comment to add to Deltek entries: `XXXXXX-000-00-0000 Sample Comment`

## Setup

1. Run `npm install` to install dependencies

2. Update the `.env` file with the correct values. 

```
URL=https://timesheet.company.com/iAccess/
USERID=123456
PASSWORD=123456
TOGGL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TOGGL_WID=654321
```

- **URL:** The URL you use to access the timesheet
- **USERID/PASSWORD:** Credentials use to login
- **TOGGL_TOKEN:** Your Toggl API token. This can be found on your [profile page](https://toggl.com/app/profile)
- **TOGGL_WID:** The target workspace ID. If you are a member of multiple workspaces they will be listed with their IDs.

## Execution

To run the script execute the following command:

`node app.js YYYY-MM-DD`

Where `YYYY-MM-DD` is the week end date of the target timesheet.

When the script completes Chrome will remain open. At this point you can review the changes and save, or close the window without saving.



