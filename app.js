require('dotenv').config()
const puppeteer = require('puppeteer');

(async () => {

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



    postProjectHours(projects);

})()




async function postProjectHours(projects) {

    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false, // launch headful mode
        args: [`--window-size=1280,1024`] // new option
        //slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
    });

    const pages = await browser.pages();
    const page = pages[0];

    //https://stackoverflow.com/questions/46198527/puppeteer-log-inside-page-evaluate
    //Uncomment to log browser log to console
    //page.on('console', consoleObj => console.og(consoleObj.text()));

    if (process.argv.length < 3) throw "Week end date must be passed as argument in YYYY-MM-DD format";

    var fragment = "#!employee/timesheet_" + process.argv[2];

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

    console.log("Complete");
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


    //Select project
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

    //Select task
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
        await page.waitForSelector(dayInputSel, { visible: true })
        console.log("Clicking day cell" + dayNum);
        await page.click(dayInputSel);

    
        const formBoxSel = "#popupForm.open";
        const dayArrowSelector = "#bottomArrow";

        try {
            await page.waitForSelector(formBoxSel, { visible: true, timeout: 100 })
        }
        catch (err) {
            
            console.log("Clicking day arrow" + dayNum);
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

    console.log("Project value selector: " + tableTrSelector);
    console.log("Project value: " + value);



    var rowCount = await page.$$eval(tableTrSelector, rows=> rows.length);
    console.log("rowCount: " + rowCount);


    //Select value if more then one row  
    var rowIndex = await page.$$eval(tableTrSelector,  (rows, value)=> {

        for (var i = 0; i < rows.length; i++) {
            var curRow = rows[i];
            var curValue = curRow.children[0].children[0].value;
                console.log("curValue: "+curValue);
            if (curValue == value) return i;
        }

        throw value + " not found";
    }, value);


    console.log("rowIndex: " + rowCount);


    //click row if more then one row
    if (rowCount > 1) {
    var rowNum = rowIndex + 1;
        var rowSelector = tableTrSelector + ":nth-child(" + rowNum + ") > td:nth-child(1)>input"
        await page.click(rowSelector);
    }

    return rowCount;
}
