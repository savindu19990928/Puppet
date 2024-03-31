const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const schedule = require('node-schedule');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const https = require('https');

const urI = "mongodb+srv://ssw1naruto:Devrious45Uzumaki@cluster0.02z5qpg.mongodb.net/puppet?retryWrites=true&w=majority&appName=Cluster0";

function extractHashtags(text) {
    if (!text) {
        return [];
    }

    const result = text.replace(/@\w+/g, '');

    return result || [];
};

const uploadVideo = async (pageUrl, filename) => {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();
    try {
        await driver.get('https://www.facebook.com');

        await driver.findElement(By.id('email')).sendKeys('devriousteam@gmail.com');
        await driver.findElement(By.id('pass')).sendKeys('Namikaze@1999/09/28');
        const loginBtn = await driver.executeScript("return [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Log in');");
        loginBtn.click();

        await driver.wait(until.urlIs('https://www.facebook.com/checkpoint/?next'));
        await driver.wait(until.urlIs('https://www.facebook.com/'));

        await driver.get(pageUrl);

        const switchBtn = await driver.executeScript("return [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Switch Now');");
        // await driver.executeScript("arguments[0].scrollIntoView();", switchBtn);

        await driver.manage().setTimeouts({ implicit: 10000 });

        // Click on the 'Upload Video' button
        const locator = By.xpath("//*[contains(text(), 'Photo/video')]");
        await driver.wait(() => driver.findElement(locator).isDisplayed(), 10000);
        const pANDv = await driver.executeScript("return [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Photo/video');");
        await driver.executeScript("arguments[0].scrollIntoView();", pANDv);
        await driver.executeScript("arguments[0].click();", pANDv);

        // Choose the file to upload
        const locator1 = By.xpath("//*[contains(text(), 'Post')]");
        await driver.wait(() => driver.findElement(locator1).isDisplayed(), 10000);
        let fileInput = await driver.findElement(By.xpath('//input[@type="file"]'));
        const fullname = filename + ".mp4";
        await fileInput.sendKeys(path.join(__dirname, 'downloads', fullname));

        // Click on the 'Post' button
        const postBtn = await driver.executeScript("return [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Post');");
        await driver.executeScript("arguments[0].click();", postBtn);

        const locator2 = By.xpath("//*[contains(text(), 'Posting')]");
        await driver.wait(() => driver.findElement(locator2).isDisplayed(), 10000);

    } finally {
        // Quit the driver
        console.log("ssss");
    }
};

const downloadVideo = async (videoUrl, filename) => {
    const fullname = filename + ".mp4";

    const file = fs.createWriteStream(path.join(__dirname, 'downloads', fullname));
    const request = https.get(videoUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(() => {
                console.log('Video downloaded successfully!');
            });
        });
    });
    request.on('error', (error) => {
        console.error('Error downloading video:', error.message);
    });
};

const deleteVideo = async (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);

        if (files.length > 0) {
            const filePath = `${folderPath}/${files[0]}`;
            fs.unlinkSync(filePath);
        } else {
            console.log('No files found in the folder:', folderPath);
        }
    } catch (err) {
        console.error('Error deleting file:', err);
    }
};

async function vList(user1) {
    let videoListf = [];
    let cursor = '0';
    while (cursor !== "noMore") {
        let options = {
            method: 'GET',
            url: 'https://tiktok-scraper7.p.rapidapi.com/user/posts',
            params: {
                unique_id: user1,
                count: '30',
                cursor: cursor
            },
            headers: {
                'X-RapidAPI-Key': 'f34902baffmsh4d26ee5486241d5p188ddfjsnf62ba6a713ab',
                'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com'
            }
        };
        const response = await axios.request(options);
        response.data.data.videos.forEach(video => {
            videoListf.push(video)
        });
        if (response.data.data.hasMore === true) {
            cursor = response.data.data.cursor;
        } else {
            cursor = "noMore";
        }
    };
    return videoListf;
};

mongoose.connect(urI);

const linkSchema = new mongoose.Schema({
    link: {
        type: String,
        required: true
    },
    caption: {
        type: String
    }
});

const pageSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true
    },
    pageid: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

const Link = mongoose.model('link', linkSchema);
const Page = mongoose.model('token', pageSchema);

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json({
    limit: '5mb'
}));

app.post('/pageadd', async function (req, res) {
    const pagename = req.body.pagename;
    const pageid = req.body.pageid;
    const token = req.body.token;

    if (req.body.pass != 'dev@tik@scraper@45') {
        return res.send('Wrong Password!');
    }

    const pageToken = new Page({
        page: pagename,
        pageid: pageid,
        url: token
    });
    await pageToken.save();

    res.send('SUCCESS');
    res.end();
});

app.post('/add', async function (req, res) {
    const usernamesS = req.body.usernames || "";
    const pageName = req.body.atoken;

    if (req.body.pass != "dev@tik@scraper@45") {
        return res.send('Wrong Password!');
    }

    const pageData = await Page.findOne({ page: pageName });
    const users = usernamesS.split(" ");

    res.send('SUCCESS');
    res.end();

    let begin = new Date();
    for (let user of users) {
        begin = new Date(begin.getTime() + 3000);
        schedule.scheduleJob(begin, async function () {
            await vList(user).then((videoList) => {
                try {
                    let start = new Date();
                    for (let video of videoList) {
                        start = new Date(start.getTime() + 3000);
                        schedule.scheduleJob(start, async function () {
                            Link.findOne({ link: video.video_id }).then(async result => {
                                if (result) {
                                    return;
                                } else {
                                    const url = 'https://www.tiktok.com/@' + user + '/video/' + video.video_id;
                                    const options1 = {
                                        method: 'GET',
                                        url: 'https://tiktok-full-info-without-watermark.p.rapidapi.com/vid/index',
                                        params: {
                                            url: url
                                        },
                                        headers: {
                                            'X-RapidAPI-Key': 'f34902baffmsh4d26ee5486241d5p188ddfjsnf62ba6a713ab',
                                            'X-RapidAPI-Host': 'tiktok-full-info-without-watermark.p.rapidapi.com'
                                        }
                                    };

                                    try {
                                        const response = await axios.request(options1);
                                        const hashtagsList = await extractHashtags(video.title);
                                        await downloadVideo(response.data.video[0], video.video_id);
                                        await uploadVideo(pageData.url, video.video_id);
                                        await deleteVideo(path.join(__dirname, 'downloads'));
                                        const livkID = new Link({
                                            link: video.video_id,
                                            caption: hashtagsList
                                        });
                                        await livkID.save();
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                            });
                        });

                    };
                } catch (error) {
                    console.error(error);
                }
            });
        });
    };
});

app.get('/robots.txt', (req, res) => {
    const filePath = path.join(__dirname, 'robots.txt');
    res.sendFile(filePath);
});

app.get('/pages', function (req, res) {
    res.render('pages');
});

app.get('/', function (req, res) {
    Page.find().then((result) => {
        const pageArray = result.map(pageResult => { return pageResult });
        res.render('usernames', { pages: pageArray });
    });
});

app.listen(process.env.PORT || 3000);
//dev@tik@scraper@45