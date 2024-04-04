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
    cy.get('input[id="email"]').type(user);
    cy.get('input[id="pass"]').type(pass);
    cy.contains('Log in').click();

    cy.intercept('https://www.facebook.com/', {});
    cy.visit(pageUrl);
    cy.contains('Reload Page').click();
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
        cy.get(`[aria-label="What's on your mind?"]`).type(video.caption);
        const time1 = getRandomNumber(2000, 4000);
        cy.wait(time1);
        cy.get('[aria-label="Post"]', { timeout: 60000 }).should('be.visible');
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
        const time = getRandomNumber(15000, 60000);
        cy.wait(time);
      });
    });
  });
});