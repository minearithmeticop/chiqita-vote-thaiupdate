const express = require('express');
const axios = require("axios");

const app = express();
const port = 3000;

// Serve static files
app.use(express.static('public'));

// Global variable to control voting status
let isVotingActive = false;
let votingProcess = null;
let totalVotes = 0;
let lastVoteTime = null;

const randomUserAgent = () => {
    const agents = [
        // Chrome on Desktop
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

        // Chrome on Mobile
        'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',

        // Firefox on Desktop
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:92.0) Gecko/20100101 Firefox/92.0',

        // Firefox on Mobile
        'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/32.1 Mobile/15E148 Safari/605.1.15',

        // Safari on Desktop
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',

        // Safari on Mobile
        'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',

        // Internet Explorer
        'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
        'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',

        // Edge
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.864.59 Safari/537.36 Edg/91.0.864.59',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.4472.124',

        // Samsung Internet
        'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.2 Chrome/67.0.3396.87 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10; SM-A505FN) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/13.0 Chrome/87.0.4280.101 Mobile Safari/537.36',

        // More generic agents
        'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/64.0',
    ];

    // เพิ่ม agents แบบสุ่มให้ครบ 100
    while (agents.length < 100) {
        agents.push(`Mozilla/5.0 (Windows NT ${Math.floor(Math.random() * 11)}.0; Win64; x64; rv:${Math.floor(Math.random() * 100)}.0) Gecko/20100101 Firefox/${Math.floor(Math.random() * 100)}.0`);
        agents.push(`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_${Math.floor(Math.random() * 16)}_${Math.floor(Math.random() * 10)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 100)}.0 Safari/537.36`);
    }

    return agents[Math.floor(Math.random() * agents.length)];
};

const createApiWithRandomAgent = () => {
    return axios.create({
        timeout: 10000,
        headers: {
            'User-Agent': randomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        },
    });
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => Math.floor(Math.random() * (1000 - 500 + 1)) + 500;

async function automateVoting() {
    const baseFetchURL = "https://polls.polldaddy.com/vote-js.php?p=14890595&b=0&a=66059327,&o=&va=16&cookie=0&tags=14890595-src:poll-oembed-simple&n=";

    try {
        // Step 1: Random User-Agent
        const api = createApiWithRandomAgent();

        // Step 2: Get n value
        await sleep(randomDelay());
        const timestamp = Date.now();
        const url = `https://poll.fm/n/2d370c3ad34459c1d834f68aef97491b/14890595?${timestamp}`;

        const nResponse = await api.get(url);
        const nData = nResponse.data;

        const nMatch = nData.match(/PDV_n\d+=\'(.*?)\'/);
        if (!nMatch || !nMatch[1]) throw new Error('ไม่พบค่า n ที่ต้องการ');
        const n = nMatch[1];

        // // Step 3: Get Math Test
        await sleep(randomDelay());
        const fetchURL = `${baseFetchURL}${n}&url=https%3A//www.thaiupdate.info/female-star-of-the-year-final/`;
        const mathsResponse = await api.get(fetchURL);
        const mathsHTML = mathsResponse.data;

        const mathsKeyMatch = mathsHTML.match(/maths_key" value="([a-f0-9]+)"/);
        const questionMatch = mathsHTML.match(/<p>(\d+\s*\+\s*\d+)\s*=\s*<\/p>/);

        if (!mathsKeyMatch || !questionMatch) throw new Error('ไม่พบข้อมูล Math Test');
        const mathsKey = mathsKeyMatch[1];
        const question = questionMatch[1];
        const answer = eval(question.replace(/\s+/g, ""));

        console.log('answer:', answer);

        // Step 4: Submit vote
        await sleep(randomDelay());
        const voteURL = `${baseFetchURL}${n}&url=https%3A//www.thaiupdate.info/female-star-of-the-year-final/&maths=1&answer=${encodeURIComponent(answer)}&maths_key=${encodeURIComponent(mathsKey)}`;
        const voteResponse = await api.get(voteURL);


        if (voteResponse.data.includes("Thank you for voting!")) {
            const match = voteResponse.data.match(/Chiquita[^(]+\((\d+,\d+)/);
            const votes = match ? match[1] : 'N/A';
            console.log(`โหวตสำเร็จ! ✅ [Thread ${process.pid}] - ${votes}`);
            totalVotes++;
            lastVoteTime = new Date();
            return { success: true, votes };
        } else {
            throw new Error("การโหวตล้มเหลว - ไม่สามารถส่งได้");
        }
    } catch (error) {
        console.error("❌ การโหวตล้มเหลว:", error.message);
        return false;
    }
}

async function startVoting() {
    isVotingActive = true;

    votingProcess = (async () => {
        while (isVotingActive) {
            await automateVoting();
        }
    })();
}

// API Endpoint
app.get('/api/vote', async (req, res) => {
    try {
        const result = await automateVoting();
        res.json({
            status: 'success',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// API Endpoints
app.get('/start', (req, res) => {
    if (isVotingActive) {
        res.json({ status: 'error', message: 'Voting process is already running' });
    } else {
        startVoting();
        res.json({ status: 'success', message: 'Voting process started' });
    }
});

app.get('/stop', (req, res) => {
    if (!isVotingActive) {
        res.json({ status: 'error', message: 'No voting process is running' });
    } else {
        isVotingActive = false;
        res.json({ status: 'success', message: 'Voting process will stop after current vote' });
    }
});

app.get('/status', (req, res) => {
    res.json({
        isActive: isVotingActive,
        totalVotes,
        lastVoteTime: lastVoteTime ? lastVoteTime.toLocaleString() : null,
        uptime: process.uptime()
    });
});

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`
Available endpoints:
- GET /start  : Start voting process
- GET /stop   : Stop voting process
- GET /status : Get current status
    `);
});
