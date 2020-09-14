const inquirer = require('inquirer')
const Ora = require('ora');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function main() {
  const { videoUrl } = await askForVideoUrl();
  const spinner = Ora('Opening Coursehunters').start();

  const titles = await retrieveVideosTitles(videoUrl);

  spinner.text = 'Copying the titles to a text file';
  writeToTextFile(titles);

  spinner.text = 'Renaming Videos';
  renameVideos();

  spinner.succeed('Files are saved');
}

module.exports = main;

/****************** HELPERS  *******************************/

async function askForVideoUrl() {
  return inquirer.prompt([{
    type: 'input',
    name: 'videoUrl',
    message: 'Enter the video url: ',
  }]);
}

async function retrieveVideosTitles(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  /** enable console.log */
  page.on('console', consoleObj => console.log(consoleObj.text()));

  const titles = await page.evaluate(() => {
    function parseTitle(title) {
      return title
        .replace('&amp', '&')
        .replace('/', ' or ')
    }

    return Array.from(document.getElementsByClassName('lessons-name'))
      .map((titleNode, idx) => `${idx + 1}. ${parseTitle(titleNode.textContent)}`)
  });

  await browser.close();
  return titles;
}


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

