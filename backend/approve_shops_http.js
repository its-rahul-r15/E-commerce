import axios from 'axios';

const ports = [8000, 5000, 3000, 5001];

async function approveAllShops() {
    for (const port of ports) {
        try {
            console.log(`Trying port ${port}...`);
            const response = await axios.post(`http://localhost:${port}/api/shops/debug/approve-all`);
            console.log(`Success on port ${port}:`, response.data);
            return;
        } catch (error) {
            console.log(`Failed on port ${port}: ${error.code || error.message}`);
        }
    }
    console.error('Could not connect to backend on any common port.');
}

approveAllShops();
