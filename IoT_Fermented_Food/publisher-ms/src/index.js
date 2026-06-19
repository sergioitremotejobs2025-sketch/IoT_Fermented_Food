const { main } = require('./app/app');

const start = async () => {
    while (true) {
        try {
            await main();
        } catch (err) {
            console.error('Error in publisher loop:', err.message);
            // Wait before retry if there was an error to avoid busy loop
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

start();
