const puppeteer = require('puppeteer')
const fs = require('fs')
const readline = require('readline')
const blank = '\n'.repeat(process.stdout.rows)
const { spawn } = require('child_process')

let content = JSON.parse(fs.readFileSync('info.json'));
const website_login_page = content.website_login_page ,
        account_mail = content.user_name,
        account_pass = content.password,
        book_link = content.book_link;

(async () => {

    console.log("Start Download..");
    console.log("Please Wait..");
    const browser = await puppeteer.launch({ headless: true, slowMo: 40, devtools: false })
    const page = await browser.newPage()

    page.setViewport({ width: 2505, height: 3159 });  // Set Width & Hieght Book Page     
    await page.goto(website_login_page) 
    
    // focus and write username 
    await page.waitForSelector('#username') // username input selector
    await page.focus('#username') 
    await page.keyboard.type(account_mail)
    // focus and write password
    await page.waitForSelector('#password') // password input selector
    await page.focus('#password')
    await page.keyboard.type(account_pass)

    await page.click('#login_button') // click login_button input selector
    await page.goto(book_link, {waitUntil : 'networkidle2'})
    
    let num = 60 // count of pages
    // await page.$eval('.total-number-of-pages', element => parseInt(element.textContent.replace(/\s/g, '').substr(2)))
    let book_name = await page.$eval('.book-title', element => element.textContent )
    var foo = [];

    for (var i = 1; i <= num; i++) {
        await page.waitForTimeout(1000)
        let id = "#mainPageContainer_"+i+" img";
        await page.waitForSelector(id)

        var img_name = "./images/"+i+".png";

        const svgImage = await page.$(id);
        const img_w = await page.$eval(id, element =>  parseInt(element.getAttribute('width')));

        if ((svgImage != undefined) || img_w <= 2505 )
        {
            await page.waitForTimeout(500)
            await svgImage.screenshot({
                path: img_name,
                omitBackground: true,
            });
            foo.push("./images/"+i+".");

            console.log(blank)
            readline.cursorTo(process.stdout, 0, 0)
            readline.clearScreenDown()
            console.log("Screen Page-"+i+" of "+num);
        }
        else
        {
            continue;
        }
    }
    
    await browser.close()  
    // run python file to OCR code start
    const childPython = spawn('python', ['run.py', book_name, foo ]); 
    childPython.stdout.on('data', (data) => {  
        console.log(`${data}`);
    })

    childPython.stderr.on('data', (data) => {
        console.error(`${data}`);
    })
    console.log("OCR Start")
    console.log(": Please Wait..")
})();
