const inquirer = require('inquirer')
const Ora = require('ora');

const scrape = require('./scrape');
const files = require('./files');

async function askForVideoUrl() {
  return inquirer.prompt([{
    type: 'input',
    name: 'videoUrl',
    message: 'Enter the video url: ',
  }]);
}

async function main() {
  const { videoUrl } = await askForVideoUrl();

  const spinner = Ora('Opening Coursehunters').start();

  const titles = await scrape(videoUrl);

  spinner.text = 'Copying the titles to a text file';
  files.writeToTextFile(titles);

  spinner.text = 'Renaming Videos';
  files.renameVideos();

  spinner.succeed('Files are saved');
}

module.exports = main;
