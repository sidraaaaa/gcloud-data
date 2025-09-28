const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

exports.parsebooks = async (event, context) => {
  const bucketName = event.bucket;
  const fileName = event.name;

  console.log(`Processing file: ${fileName} from bucket: ${bucketName}`);

  const file = storage.bucket(bucketName).file(fileName);
  const contents = (await file.download())[0].toString('utf8');

  const lines = contents.toString().split('\r\n');
  const headers = lines[0].split(',');
  const genreIndex = headers.indexOf('genre');

  const counts = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const group = cols[genreIndex];
    if (group) {
      counts[group] = (counts[group] || 0) + 1;
    }
  }
  const genres = Object.keys(counts);
  const genreCount = Object.values(counts);
  const maxCount = Math.max(...genreCount);
  

  // loop through all the max count genres
  var freqGenres = []
  for (i in counts){
    if (counts[i] == maxCount){
        freqGenres.push(i);
    }
  }

  console.log('Number of Rows (Books)', (lines.length) - 1);
  console.log('Distinct Genres:', genres);
  console.log('Most Frequent Genre:', freqGenres);
  console.log('Book Genre Histogram');
  
  // Sort genres for a consistent output
  const entries = Object.entries(counts);
  const sortedGenres = entries.sort((a, b) => a[1] - b[1]);

  for (const genre of sortedGenres) {
    const count = genre[1];
    // Create a simple text-based bar for visualization
    const bar = '█'.repeat(count);
    const percentage = ((count / maxCount) * 100).toFixed(0);

    console.log(`${genre[0].padEnd(20, '.')}: ${bar} ${count} (${percentage}%)`);
  }

};