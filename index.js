const axios = require("axios");

const randomUserAgent = () => {
    const agents = [
        // หาเพิ่ม agent เอง จะไป gen ใน chatapt ก็ได้
    ];

    // เพิ่ม agents แบบสุ่มให้ครบ 100
    while (agents.length < 100) {
        
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
const randomDelay = () => Math.floor(Math.random() * (1000 - 1000 + 1)) + 1000;

async function automateVoting() {
    const baseFetchURL = "https://polls.polldaddy.com/vote-js.php?p=14790988&b=0&a=65657660,&o=&va=16&cookie=0&tags=14790988-src:poll-oembed-simple&n=";

    try {
        // Step 1: Random User-Agent
        const api = createApiWithRandomAgent();

        // Step 2: Get n value
        await sleep(randomDelay());
        const timestamp = Date.now();
        const url = `https://poll.fm/n/31ca8bcfb9002a437240cfd87e440570/14790988?${timestamp}`;

        const nResponse = await api.get(url);
        const nData = nResponse.data;

        const nMatch = nData.match(/PDV_n\d+=\'(.*?)\'/);
        if (!nMatch || !nMatch[1]) throw new Error('ไม่พบค่า n ที่ต้องการ');
        const n = nMatch[1];

        // // Step 3: Get Math Test
        await sleep(randomDelay());
        const fetchURL = `${baseFetchURL}${n}&url=https%3A//www.thaiupdate.info/female-star-of-the-year-group-2/`;
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
        const voteURL = `${baseFetchURL}${n}&url=https%3A//www.thaiupdate.info/female-star-of-the-year-group-2/&maths=1&answer=${encodeURIComponent(answer)}&maths_key=${encodeURIComponent(mathsKey)}`;
        const voteResponse = await api.get(voteURL);


        if (voteResponse.data.includes("Thank you for voting!")) {
            const match = voteResponse.data.match(/Chiquita[^(]+\((\d+,\d+)/);
            const votes = match ? match[1] : 'N/A';
            console.log(`โหวตสำเร็จ! ✅ [Thread ${process.pid}] - ${votes}`);
            return true;

        } else {
            throw new Error("การโหวตล้มเหลว - ไม่สามารถส่งได้");
        }
    } catch (error) {
        console.error("❌ การโหวตล้มเหลว:", error.message);
        return false;
    }
}

(async () => {
    for (let i = 0; i < 10000000; i++) {
        console.log(`เริ่มโหวตครั้งที่ ${i + 1}`);
        await automateVoting();
    }
})();
