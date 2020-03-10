require('dotenv').config()
const puppeteer = require('puppeteer');
const got = require('got');

(async () => {

    if (process.argv.length < 3) throw "Week end date must be passed as argument in YYYY-MM-DD format";
    var weekEnd = process.argv[2];


    var weDate = new Date(weekEnd);
    var untilDate = new Date(weDate.valueOf());
    var untilStr = untilDate.toISOString().substring(0, 10);

    var sinceDate = new Date(weDate.valueOf());
    sinceDate.setDate(sinceDate.getDate() - 6);
    var sinceStr = sinceDate.toISOString().substring(0, 10);

    console.log("sinceStr = " + sinceStr);
    console.log("untilStr = " + untilStr);



    var togglTimes = await getTogglTime(sinceStr, untilStr);

    var projects = toggleTimesToProjects(togglTimes, weDate);



    //var projects = getSampleProjects();
    postProjectHours(projects, weekEnd);

})()


function getSampleProjects()
{

    var projects = [

        {
            "projectNumber": "TEC100-001",
            "phase": "04",
            "task": "0000",
            "laborCode": null,
            "days": [
                null, null
                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
            ]

        },

        {
            "projectNumber": "TEC100-003",
            "phase": "00",
            "task": "0000",
            "laborCode": null,
            "days": [
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,

                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,

                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,
                null, null
            ]

        },

        {
            "projectNumber": "RND100-000",
            "phase": "00",
            "task": "0000",
            "laborCode": null,
            "days": [
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,

                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,

                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,
                null, null
            ]

        },

        {
            "projectNumber": "212125-714",
            "phase": "25",
            "task": "0401",
            "laborCode": null,
            "days": [
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,

                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,

                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }

                ,
                {
                    "regular": 1,
                    "overtime": 1,
                    "overtime2": 1,
                    "comment": "Comment"
                }
                ,
                null, null
            ]

        }

    ]

    return projects;


}



function toggleTimesToProjects(togglTimes, weDate)
{

    console.log("Week End Date:"+ weDate);



    var projects = [];

    var sampProj = [    {
                        "projectNumber": "TEC100-001",
                        "phase": "04",
                        "task": "0000",
                        "laborCode": null,
                        "days": [    
                                    {
                                        "regular": 1,
                                        "overtime": 1,
                                        "overtime2": 1,
                                        "comment": "Comment"
                                    }
                                ]
                        }
                    ];

    const regex = /^([A-Z0-9]{6}-\d{3})-(\d{2})-(\d{4})(\s(.*))?$/;

    //Calc the week start time
    var wstartDate = new Date(weDate.valueOf());
    wstartDate.setDate(wstartDate.getDate() - 6);
    console.log("Week Start:" + wstartDate);
    var wstartDateMs = wstartDate.getTime();

    for (var i=0; i < togglTimes.length; i++)
    {
        var toggleTime =togglTimes[i];

        var startDate = new Date(toggleTime.start);
        console.log("Start Date:" + startDate);
        if(!toggleTime.project) throw new "Time entry missing project. StartDate: "+startDate;

        //Parse project information from client name
        if (toggleTime.client == null) throw new "Client missing from project: " + toggleTime.project;
        var match = toggleTime.client.match(regex);
        if(match == null) throw "Could not parse client: "+ toggleTime.client;

        var projectNumber = match[1];
        var phase = match[2];
        var task = match[3];

        var comment ="";
        if (match[5]) comment = match[5];

        //Determine the day index
        //sat =0, sun =1, mon =2
        var startDateMs = startDate.getTime();
        var differenceMs = startDateMs - wstartDateMs;

        const oneDayMs = 1000 * 60 * 60 * 24;
        var dayIndex = Math.floor(differenceMs/oneDayMs)

        //Read duration in hours
        var durHr = toggleTime.dur / 3.6e6;

    }


                        

    
    
    return projects;

}








async function getTogglTime(since, until)

{
    var wsReqOpt = {
        url:"https://www.toggl.com/api/v8/workspaces",
        method:"GET",
        username: process.env.TOGGL_TOKEN,
        password: 'api_token'
    }

    var wsResp = await got(wsReqOpt);


    var workspaces = JSON.parse(wsResp.body);

    var wid = null;

    for (i = 0; i < workspaces.length;i++) {
        var wksp = workspaces[i];
        console.log(wksp.name + " " + wksp.id);
    }

    if (workspaces.length == 1) {
        wid = workspaces[0].id;
        console.log("One Toggl workspace found with id: " + wid);
    }
    else if (process.env.TOGGL_WID) {
        wid = process.env.TOGGL_WID;
        console.log("Using configured Toggl workspace id: " + wid);
    }
    else {
        console.log("Multiple workspaces found, and TOGGL_WID not configured");
    }

    var total_count = 0;
    var togglEntires =[];
    var page =1;
    var user_agent = "toggl-to-deltek";

    var timeRangeParameters = "";

    if(since)
    {
        timeRangeParameters += "&since=" + since;
    }

    if (until) {
        timeRangeParameters += "&until=" + until;
    }

    do
    {
        var togglDetReq = {
            url: "https://toggl.com/reports/api/v2/details?user_agent=" + user_agent+"&workspace_id="+wid+"&page="+page+timeRangeParameters,
            method: "GET",
            username: process.env.TOGGL_TOKEN,
            password: 'api_token'
        }

        console.log("GET " + togglDetReq.url);

        var togglDetResp = await got(togglDetReq);
        var toggleDetObj = JSON.parse(togglDetResp.body);
        total_count = toggleDetObj.total_count;

        console.log("total_count = "+total_count);
        console.log("toggleDetObj.data.length = " + toggleDetObj.data.length);

        for (i = 0; i < toggleDetObj.data.length;i++)
        {
            togglEntires.push(toggleDetObj.data[i]);
        }

        page++;

    } while (togglEntires.length < total_count)

    return togglEntires;
}


async function postProjectHours(projects, weekEnd) {

    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false, // launch headful mode
        args: [`--window-size=1280,1024`] // new option
        //slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
    });

    const pages = await browser.pages();
    const page = pages[0];

    var fragment = "#!employee/timesheet_" + weekEnd;

    var url = process.env.URL + fragment;

    console.log("Opening URL: " + url);
    await page.goto(url);

    console.log("Entering userid")
    const userIdSelector = "#userID";
    await page.waitForSelector(userIdSelector, { visible: true })
    await page.type(userIdSelector, process.env.USERID);

    console.log("Entering password")
    const passwordSelector = "#password";
    await page.waitForSelector(passwordSelector, { visible: true })
    await page.type(passwordSelector, process.env.PASSWORD);

    console.log("Logging in")
    const loginButtonSelector = "#loginForm > div.buttons.navigator_ngcrm_widgets_button_bar > div > button";
    await page.waitForSelector(loginButtonSelector, { visible: true })
    await page.click(loginButtonSelector);

    console.log("Reading current status")
    const statusSelector = "#TimesheetStatus";
    await page.waitForSelector(statusSelector, { visible: true })
    await page.waitForFunction("document.querySelector(\"" + statusSelector + "\").innerText.length > 0");
    const status = await page.$eval(statusSelector, function (x) { return x.innerText; });
    console.log("Status = " + status);
    if (status != "In Progress") throw "Status is not in progress";

    //Add Projects
    for (var i = 0; i < projects.length; i++) {
        await addProject(page, projects[i]);
    }

    console.log("Completed Entering Timesheet");
}


async function addProject(page, project) {
    console.log("Entering project: " + project.projectNumber + "-" + project.phase + "-" + project.task);

    //Add Row
    const addLineButtonSelector = "#addLineBttn";
    await page.waitForSelector(addLineButtonSelector, { visible: true })
    await page.click(addLineButtonSelector);
    

    //Get Row count
    const wbsTableBodySelector = "#wbsGridBody > table > tbody";
    await page.waitForSelector(wbsTableBodySelector, { visible: true })
    var rowNumber = await page.$eval(wbsTableBodySelector, tableBody => tableBody.children.length);
    console.log("rowNumber = " + rowNumber);
    
    //Clicks search button
    var projSearchButtonSelector = "#wbsGridBody > table > tbody > tr:nth-child(" + rowNumber + ") > td:nth-child(1) > div > button";
    await page.waitForSelector(projSearchButtonSelector, { visible: true });
    await page.click(projSearchButtonSelector);


    //search for project number
    var projectSearchBoxSelector = "#ProjectSearchByText";
    await page.waitForSelector(projectSearchBoxSelector, { visible: true });


    //Wait for inital list of projects
    var projectTrSelector = "#wbs1ListBody > table > tbody > tr"
    await page.waitFor((s) => document.querySelectorAll(s).length > 0, {}, projectTrSelector);

    console.log("Searching for project number: " + project.projectNumber);
    await page.type(projectSearchBoxSelector, project.projectNumber);


    console.log("Waiting for project list to empty");
    await page.waitFor((s) => document.querySelectorAll(s).length == 0, {}, projectTrSelector);

    console.log("Waiting for project search results");
    await page.waitFor((s) => document.querySelectorAll(s).length > 0, {}, projectTrSelector);


    //Select Project
    var numProjects = await selectProjectTableValue(page, projectTrSelector, project.projectNumber);

    //Select phase
    var phaseTrSelector = "#wbs2ListBody > table > tbody > tr"
    if(numProjects>1)
    {
        console.log("Waiting for phase list to empty");
        await page.waitFor((s) => document.querySelectorAll(s).length == 0, {}, phaseTrSelector);
    }

    console.log("Waiting for phase search results");
    await page.waitFor((s) => document.querySelectorAll(s).length > 0, {}, phaseTrSelector);
    var numPhases = await selectProjectTableValue(page, phaseTrSelector, project.phase);

    //Select Task
    var tasksTrSelector = "#wbs3ListBody > table > tbody > tr"
    if(numPhases>1)
    {
        console.log("Waiting for task list to empty");
        await page.waitFor((s) => document.querySelectorAll(s).length == 0, {}, tasksTrSelector);
    }

    console.log("Waiting for task search results");
    await page.waitFor((s) => document.querySelectorAll(s).length > 0, {}, tasksTrSelector);
    await selectProjectTableValue(page, tasksTrSelector, project.task);
    
    //Wait for select button to enable
    var selectProjectButtonSelector = "#finishBttn.btn.pn-blue";
    await page.waitForSelector(selectProjectButtonSelector, { visible: true })
    await page.click(selectProjectButtonSelector);

    //Wait for project dialog to go away
    var projectLookupdivSel = "#projectLookupDiv";
    await page.waitForSelector(projectLookupdivSel, { hidden: true })
    
    var laborCodeInputSelector = "#wbsGridBody > table > tbody > tr:nth-child(" + rowNumber + ") > td:nth-child(8) > div > div.inputContainer > input";

    if (project.laborCode) {
        await page.waitForSelector(laborCodeInputSelector, { visible: false })
        await page.click(laborCodeInputSelector);
        await page.type(laborCodeInputSelector, "");
        await page.type(laborCodeInputSelector, project.laborCode);
    }

    if (project.days.length != 7) throw "project.days != 7";

    for (var i = 0; i < 7; i++) {

        var dayNum = i + 1;
        var currentDay = project.days[i];

        if (currentDay == null) {
            console.log("Skipping day " + dayNum);
            continue;
        }
                
        console.log("Adding day " + dayNum);
        
        var dayInputSel = "#hrsGridBody > table > tbody > tr:nth-child(" + rowNumber + ") > td:nth-child(" + dayNum + ")"
        await page.waitForSelector(dayInputSel, { visible: true });
        await page.click(dayInputSel);

    
        const formBoxSel = "#popupForm.open";
        const dayArrowSelector = "#bottomArrow";
        
        try {
            await page.waitForSelector(formBoxSel, { visible: true, timeout: 100 })
        }
        catch (err) {
            
            await page.click(dayArrowSelector);            
            await page.waitForSelector(formBoxSel, { visible: true, timeout: 100 })
        }

        var regularSelector = "#regHrs"
        var overTimeSelector = "#ovtHrs"
        var overTime2Selector = "#ovt2Hrs"
        var comentSelector = "#commentEntry";

        if (currentDay.regular) await page.type(regularSelector, currentDay.regular.toString());
        if (currentDay.overtime) await page.type(overTimeSelector, currentDay.overtime.toString());
        if (currentDay.overtime2) await page.type(overTime2Selector, currentDay.overtime2.toString());
        if (currentDay.comment) await page.type(comentSelector, currentDay.comment);
    }
}

async function selectProjectTableValue(page, tableTrSelector, value) {

    console.log("Selecting value: " + value);
    var rowCount = await page.$$eval(tableTrSelector, rows=> rows.length);

    //Select value if more then one row  
    var rowIndex = await page.$$eval(tableTrSelector,  (rows, value)=> {

        for (var i = 0; i < rows.length; i++) {
            var curRow = rows[i];
            var curValue = curRow.children[0].children[0].value;
            if (curValue == value) return i;
        }

        throw value + " not found";
    }, value);

    //click row if more then one row
    if (rowCount > 1) {
    var rowNum = rowIndex + 1;
        var rowSelector = tableTrSelector + ":nth-child(" + rowNum + ") > td:nth-child(1)>input"
        await page.click(rowSelector);
    }

    return rowCount;
}
