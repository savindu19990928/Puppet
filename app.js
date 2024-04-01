const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const schedule = require('node-schedule');
const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');

const urI = "mongodb+srv://ssw1naruto:Devrious45Uzumaki@cluster0.02z5qpg.mongodb.net/puppet?retryWrites=true&w=majority&appName=Cluster0";

function extractHashtags(text) {
    if (!text) {
        return [];
    }

    const result = text.replace(/@\w+/g, '');

    return result || [];
};

const uploadVideo = async (pageUrl, filename) => {
    const fullname = filename + ".mp4";
    const fpath = path.resolve(__dirname, 'cypress', 'e2e', 'downloads', fullname);
    const currentDirectory = process.cwd();

    const command = 'npx';
    const args = [
        'cypress',
        'run',
        '--spec',
        'cypress/e2e/fbUpload.cy.js',
        '--env',
        `PAGE_URL=${pageUrl}`,
        `FILE_PATH=${fpath}`
    ];

    // Execute command
    const childProcess = spawn(command, args, { cwd: currentDirectory, shell: 'bash' });

    childProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
};

const downloadVideo = async (videoUrl, filename) => {
    const fullname = filename + ".mp4";

    const file = fs.createWriteStream(path.join(__dirname, 'cypress', 'e2e', 'downloads', fullname));
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
        begin = new Date(begin.getTime() + 1000);
        schedule.scheduleJob(begin, async function () {
            await vList(user).then((videoList) => {
                try {
                    let start = new Date();
                    for (let video of videoList) {
                        start = new Date(start.getTime() + 1000);
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
                                        // await deleteVideo(path.join(__dirname, 'downloads'));
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