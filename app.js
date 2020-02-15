require('dotenv').config()
const puppeteer = require('puppeteer');


const userIdSelector = "#userID";
const passwordSelector = "#password";
const loginButtonSelector = "#loginForm > div.buttons.navigator_ngcrm_widgets_button_bar > div > button";
const wbsTableSelector = "#wbsGridBody > table";





const hrsTableSelector = "#hrsGridBody > table";
const addLineButtonSelector = "#addLineBttn";
const statusSelector = "#TimesheetStatus";


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

    //    hours = [];

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
    page.on('console', consoleObj => console.log(consoleObj.text()));


    if (process.argv.length < 3) throw "Week end date must be passed as argument in YYYY-MM-DD format";

    var fragment = "#!employee/timesheet_" + process.argv[2];

    var url = process.env.URL + fragment;

    console.log("Opening URL: " + url);
    await page.goto(url);

    console.log("Entering userid")
    await page.waitForSelector(userIdSelector, { visible: true })
    await page.type(userIdSelector, process.env.USERID);

    console.log("Entering password")
    await page.waitForSelector(passwordSelector, { visible: true })
    await page.type(passwordSelector, process.env.PASSWORD);

    console.log("Logging in")
    await page.waitForSelector(loginButtonSelector, { visible: true })
    await page.click(loginButtonSelector);


    console.log("Reading current status")
    await page.waitForSelector(statusSelector, { visible: true })
    await page.waitForFunction("document.querySelector(\"" + statusSelector + "\").innerText.length > 0");
    const status = await page.$eval(statusSelector, function (x) { return x.innerText; });
    console.log("Status = " + status);
    if (status != "In Progress") throw "Status is not in progress";


    //Counting Rows
    const wbsTableBodySelector = "#wbsGridBody > table > tbody";
    await page.waitForSelector(wbsTableBodySelector, { visible: true })
    var rowCount = await page.$eval(wbsTableBodySelector, tableBody => tableBody.children.length);
    if (rowCount == undefined) rowCount = 0;

    console.log(projects.length + " rows required");
    console.log(rowCount + " existing rows");


    if (rowCount < projects.length) await addRows(page, projects.length - rowCount);
    else if (rowCount > projects.length) await deleteRows(page, rowCount - projects.length);


    for (var i = 0; i < projects.length; i++) {
        await enterProject(page, i + 1, projects[i]);
    }


    console.log("Complete");


}


function delay(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}


async function waitForSelectorToggle(page,selector)
{
    //wait for busy field to appear and go away
    console.log("Waiting for selector to appear: " + selector);
    await page.waitForSelector(selector, { visible: true });

    console.log("Waiting for selector to disappear: " + selector);
    await page.waitFor((s) => !document.querySelector(s),{},selector);
}

async function enterProject(page, rowNumber, project) {
    console.log("Entering project: " + project.projectNumber + "-" + project.phase + "-" + project.task);

    console.log("Selecting row " + rowNumber);

    //var rowClickSelector = "#toolsGridBody > table > tbody > tr:nth-child(" + rowNumber+") > td > div";
    var rowClickSelector = "#wbsGridBody > table > tbody > tr:nth-child(" + rowNumber + ") > td:nth-child(1) > div > div.inputContainer > input";
    //var rowClickSelector = "#hrsGridBody > table > tbody > tr:nth-child(" + rowNumber + ") > td:nth-child(35)>input"
    await page.waitForSelector(rowClickSelector, { visible: true })
    await delay(1000);
    await page.click(rowClickSelector);
    await delay(1000);



    //Clicks search button
    var projSearchButtonSelector = "#wbsGridBody > table > tbody > tr:nth-child(" + rowNumber + ") > td:nth-child(1) > div > button";
    await page.waitForSelector(projSearchButtonSelector, { visible: true });
    await page.click(projSearchButtonSelector);


    //search for project number
    var projectSearchBoxSelector = "#ProjectSearchByText";
    await page.waitForSelector(projectSearchBoxSelector, { visible: true });
    console.log("Searching for project number: " + project.projectNumber);
    await page.type(projectSearchBoxSelector, project.projectNumber);

    //Wait for project number spinner
    await waitForSelectorToggle(page, "#wbs1ListBusyIndicator > div.spinner");

    //Select phase
    await selectProjectTableValue(page, "#wbs2ListBody > table > tbody", project.phase);

    //Wait for task spinner
    await waitForSelectorToggle(page, "#wbs3ListBusyIndicator > div.spinner");

    //select task
    await selectProjectTableValue(page, "#wbs3ListBody > table > tbody", project.task);
    

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


    for (var i = 0; i < 7; i++) {


        var dayNum = i + 1;
        console.log("Adding day " + dayNum);

        if (project.days.length != 7) throw "project.days != 7";
        var currentDay = project.days[i];

        if (currentDay == null) {
            console.log("Skipping day " + dayNum);
            continue;
        }

        var dayInputSel = "#hrsGridBody > table > tbody > tr:nth-child(" + rowNumber + ") > td:nth-child(" + dayNum + ")"

        //await page.type(dayInputSel, currentDay.regular.toString());

        await page.waitForSelector(dayInputSel, { visible: true })
        console.log("Clicking day cell" + dayNum);
        await page.click(dayInputSel);


        var dayArrowSelector = "#bottomArrow";
        var formBoxSel = "#popupForm.open";



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

async function selectProjectTableValue(page, tableBodySelector, value) {

    //Select phase
    var rowsSelector = tableBodySelector + " > tr";

    await page.waitForFunction("document.querySelectorAll(\"" + rowsSelector + "\").length > 0");

    var rowIndex = await page.$$eval(rowsSelector, function (rows, value) {

        for (var i = 0; i < rows.length; i++) {
            var curRow = rows[i];
            var curValue = curRow.children[0].children[0].value;
            if (curValue == value) return i;
        }

        throw value + " not found";
    }, value);

    var rowNum = rowIndex + 1;

    var rowSelector = tableBodySelector + " > tr:nth-child(" + rowNum + ") > td:nth-child(1)>input"
    await page.click(rowSelector);
}



async function addRows(page, count) {

    console.log("Adding " + count + " rows");


    for (var i = 0; i < count; i++) {
        await page.waitForSelector(addLineButtonSelector, { visible: true })
        await page.click(addLineButtonSelector);
    }

}


async function deleteRows(page, count) {

    console.log("Deleting " + count + " rows");


    var deleteMenuItemSelector = "#toolsGridContainerDdwn > div > ul > li:nth-child(3) > a";
    var lastRowSelector = "#hrsGridBody>table>tbody>tr:last-of-type>td:last-of-type";
    var rowEditCaretSelector = "#toolsGridBody > table > tbody > tr.selected";
    var delConfirmButtonSelector = "#buttons > div > button.btn.pn-blue.primary";




    for (var i = 0; i < count; i++) {

        await page.waitForSelector(lastRowSelector, { visible: true })
        await page.click(lastRowSelector);

        await page.waitForSelector(rowEditCaretSelector, { visible: true })
        await page.click(rowEditCaretSelector);

        await page.waitForSelector(deleteMenuItemSelector, { visible: true })
        await page.click(deleteMenuItemSelector);

        await page.waitForSelector(delConfirmButtonSelector, { visible: true })
        await page.click(delConfirmButtonSelector);
    }
}

