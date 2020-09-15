const fs = require('fs');
const path = require('path');

const LESSON = 'lesson'
const LESSON_TITLES_TXT = './lessons_titles.txt';
const VIDEOS_FOLDER = './videos';

function getVideosExtension() {
  const files = fs.readdirSync('./');

  for (let file of files) {
    if (file.startsWith(LESSON)) return path.extname(file);
  }
}

function writeToTextFile(titles) {
  const extension = getVideosExtension();
  const titlesText = titles
    .map(title => `${title}${extension}`)
    .join('\n');

  fs.writeFileSync(LESSON_TITLES_TXT, titlesText)
}

function renameVideos() {
  const titles = fs.readFileSync(LESSON_TITLES_TXT, 'utf-8')
    .split(/\r?\n/)
    .filter(x => !!x);

  /** create a new videos folder */
  fs.mkdirSync(VIDEOS_FOLDER);

  /** copy the old file to a new folder */
  titles.forEach((newTitle, idx) => {
    const lessonNumber = Number(idx + 1);
    const oldFilePath = `./${LESSON}${lessonNumber}${path.extname(newTitle)}`;
    const newFilePath = `${VIDEOS_FOLDER}/${newTitle}`;

    fs.copyFileSync(oldFilePath, newFilePath);
  });

  // delete the lesson title file
  fs.unlinkSync(LESSON_TITLES_TXT);
}

module.exports = {
  writeToTextFile,
  renameVideos,
}