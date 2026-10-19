const http = require('http');

const targets = [
  { label: 'SSR', url: process.env.SSR_URL || 'http://localhost:5000/ssr' },
  { label: 'CSR', url: process.env.CSR_URL || 'http://localhost:5173/' },
];
const samples = Number(process.env.BENCHMARK_SAMPLES || 10);

function request(target) {
  return new Promise((resolve, reject) => {
    const startedAt = process.hrtime.bigint();
    const request = http.get(target.url, (response) => {
      let bytes = 0;
      response.on('data', (chunk) => { bytes += chunk.length; });
      response.on('end', () => resolve({
        label: target.label,
        status: response.statusCode,
        bytes,
        durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
      }));
    });
    request.on('error', reject);
  });
}

async function main() {
  for (const target of targets) {
    const results = [];
    for (let index = 0; index < samples; index += 1) results.push(await request(target));
    const average = results.reduce((total, result) => total + result.durationMs, 0) / results.length;
    const first = results[0];
    console.log(`${first.label}\tstatus=${first.status}\tbytes=${first.bytes}\taverage_ms=${average.toFixed(2)}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
