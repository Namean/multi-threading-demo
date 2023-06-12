const express = require('express');
const { Worker } = require('worker_threads');
const THREAD_COUNT = 4;
const app = express();
const port = process.env.pORT || 3000;


app.get('/non-blocking', (req, res) => {
	res.status(200).send('This page is non-blocking');
});

function createWorker() {
	return new Promise(function (resolve, reject) {
		const worker = new Worker('./four_workers.js', {
			workerData: { thread_count: THREAD_COUNT },
		});
		worker.on('message', (data) => {
			resolve(data);
		});
		worker.on('error', (msg) => {
			reject(`An error occurred: ${msg}`);
		});
	});
}



app.get('/blocking', async (req, res) => {
  const workerPromises = [];
	for (let i = 0; i < THREAD_COUNT; ++i) {
		workerPromises.push(createWorker());
	}

	const thread_results = await Promise.all(workerPromises);
	const total = thread_results.reduce((acc, cv) => acc + cv);
	res.status(200).send(`result is ${total}`);
});


app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
