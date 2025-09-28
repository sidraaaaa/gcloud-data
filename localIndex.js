// const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

exports.parseCSV = async (event, context) => {
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

  console.log('Genre counts:');
  Object.entries(counts).forEach(([group, count]) => {
    console.log(`${group}: ${count}`);
  });
};