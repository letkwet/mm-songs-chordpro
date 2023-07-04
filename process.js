const ChordSheetJS = require('chordsheetjs').default;
const fs = require('fs');
const { globSync } = require('glob');

const parser = new ChordSheetJS.ChordProParser();

const files = globSync('./songs/**/*.cho');
console.log("Creating import file for following songs");
console.log(files);

const songDict = {};

for (const file of files) {
  const lyrics = fs.readFileSync(file).toString();
  const cho = parser.parse(lyrics);
  const {title, artist, album} = cho.metadata;
  if (!title || !artist) {
    console.error(`Both title and artist tags are required in '${file}' file.`);
    return;
  }

  const artists = typeof artist === 'string' ? [artist] : artist;
  const artist_key = artists.join('_');
  const key = `${title}_${artist_key}`;
  if (key in songDict) {
    console.error(`'${file}' file's title and artist are in conflict with previous file`);
    return;
  }

  songDict[key] = { key, artists, title, album, lyrics };

}

const songDb = { songs: Object.values(songDict) };

if (!fs.existsSync('build')) {
  fs.mkdirSync('build');
}

fs.writeFileSync(`build/songs.json`, JSON.stringify(songDb));
