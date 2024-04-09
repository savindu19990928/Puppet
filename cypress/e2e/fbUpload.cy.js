const pageUrl = Cypress.env('PAGE_URL');
const pass = Cypress.env('PASS');
const user = Cypress.env('USER');
import path from 'path';

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('Facebook Login and Video Upload', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('Logs in through Facebook authentication', () => {
    cy.visit('https://www.facebook.com/');
    cy.contains('Разрешить все cookie').click();
    cy.contains('На главную').click();
    cy.visit(pageUrl);
    cy.contains('Обновить страницу', { timeout: 60000 }).should('be.visible');
    cy.contains('Обновить страницу').click();
    cy.get('[aria-label="Close"]', { timeout: 120000 }).should('be.visible');
    cy.get('[aria-label="Close"]').click();
    cy.get('[aria-label="Email or phone"]').type(user);
    cy.get('[aria-label="Password"]').type(pass);
    cy.get('[aria-label="Accessible login button"]').click();
    cy.contains('Switch Now', { timeout: 60000 }).should('be.visible');
    cy.contains('Switch Now').click();
    cy.wait(10000);
    cy.task('getDynamicEntries', pageUrl).then((entries) => {
      cy.wrap(entries).each(video => {
        cy.contains('Photo/video').scrollIntoView();
        cy.contains('Photo/video').click();
        const fullName = video.name + '.mp4';
        const fpath = path.join(__dirname, 'downloads', fullName);
        cy.contains('Add Photos/Videos').selectFile(fpath, { action: 'drag-drop', force: true });
        const cap = video.caption + '   ';
        cy.get(`[aria-label="What's on your mind?"]`).type(cap);
        const time1 = getRandomNumber(2000, 4000);
        cy.wait(time1);
        cy.get('[aria-label="Post"]', { timeout: 120000 }).should('be.visible');
        cy.get('[aria-label="Post"]').click();
        const time2 = getRandomNumber(2000, 4000);
        cy.wait(time2);
        cy.get('body').then(($body) => {
          if ($body.find('*:contains("Not now")').length > 0) {
            cy.contains('Not now').click();
          }
        });
        cy.contains('Posting', { timeout: 120000 }).should('be.visible');
        cy.contains('Posting', { timeout: 120000 }).should('not.exist');
        cy.task('updateDynamicEntry', { videoID: video._id });
        const time = getRandomNumber(90000, 120000);
        cy.wait(time);
      });
    });
  });
});