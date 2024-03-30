const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const schedule = require('node-schedule');
const puppeteer = require('puppeteer');

const urI = "mongodb+srv://ssw1naruto:Devrious45Uzumaki@cluster0.02z5qpg.mongodb.net/puppet?retryWrites=true&w=majority&appName=Cluster0";

function extractHashtags(text) {
    if (!text) {
        return [];
    }

    const result = text.replace(/@\w+/g, '');

    return result || [];
};

const downloadVideo = async (videoUrl) => {
    const writer = fs.createWriteStream(path.join(__dirname, 'downloads'));

    const response = await axios({
        videoUrl,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
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

// app.post('/pageadd', async function (req, res) {
//     const pagename = req.body.pagename;
//     const pageid = req.body.pageid;
//     const token = req.body.token;
//     const tokenList = token.split(" ");

//     if (req.body.pass != 'dev@tik@scraper@45') {
//         return res.send('Wrong Password!');
//     }

//     const pageToken = new Page({
//         page: pagename,
//         pageid: pageid,
//         token: tokenList
//     });
//     await pageToken.save();

//     res.send('SUCCESS');
//     res.end();
// });

app.post('/add', async function (req, res) {
    const usernamesS = req.body.usernames || "";

    if (req.body.pass != "dev@tik@scraper@45") {
        return res.send('Wrong Password!');
    }
    const users = usernamesS.split(" ");

    res.send('SUCCESS');
    res.end();

    let begin = new Date();
    for (let user of users) {
        begin = new Date(begin.getTime() + 3000);
        schedule.scheduleJob(begin, async function () {
            await vList(user).then((videoList) => {
                try {
                    let vcount = 0;
                    let start = new Date();
                    for (let video of videoList) {
                        start = new Date(start.getTime() + 20000);
                        schedule.scheduleJob(start, async function () {
                            ++vcount;
                            if (vcount === 60) {
                                vcount = 0;
                                await runPauseTask();
                            };
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
                                        downloadVideo(response.data.video[0]).then(async () => {
                                            //Upload video
                                            await deleteVideo(path.join(__dirname, 'downloads'));
                                            const livkID = new Link({
                                                link: video.video_id,
                                                caption: hashtagsList
                                            });
                                            await livkID.save();
                                        });
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

// app.get('/pages', function (req, res) {
//     res.render('pages');
// });

app.get('/', function (req, res) {
    Token.find().then((result) => {
        const pageArray = result.map(pageResult => { return pageResult });
        res.render('usernames', { pages: pageArray });
    });
});

app.listen(process.env.PORT || 3000);
//dev@tik@scraper@45