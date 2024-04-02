const pageUrl = Cypress.env('PAGE_URL');
import path from 'path';

describe('Facebook Login and Video Upload', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('Logs in through Facebook authentication', () => {
    cy.visit('https://www.facebook.com/');
    cy.get('input[id="email"]').type('devriousteam@gmail.com');
    cy.get('input[id="pass"]').type('Namikaze@1999/09/28');
    cy.contains('Log in').click();

    cy.intercept('https://www.facebook.com/', {});
    cy.visit("https://www.facebook.com/profile.php?id=100086654302870");
    try {
      cy.contains('Reload Page').click();
    } catch (error) {
      console.log(error);
    }
    cy.contains('Switch Now').click();
    cy.wait(10000);

    cy.task('getDynamicEntries', 'https://www.facebook.com/profile.php?id=100086654302870').then((entries) => {
      cy.wrap(entries).each(video => {
        try {
          cy.contains('Photo/video').scrollIntoView();
          cy.contains('Photo/video').click();
          const fullName = video.link + '.mp4';
          const fpath = path.join(__dirname, 'downloads', fullName);
          cy.contains('Add Photos/Videos').selectFile(fpath, { action: 'drag-drop', force: true });
          cy.wait(2000);
          cy.get('[aria-label="Post"]', { timeout: 30000 }).should('be.visible');
          cy.get('[aria-label="Post"]').click();
          cy.wait(2000);
          cy.contains('Posting', { timeout: 60000 }).should('be.visible');
          cy.contains('Posting', { timeout: 60000 }).should('not.exist');
          cy.task('updateDynamicEntry', { pageurl: 'https://www.facebook.com/profile.php?id=100086654302870', videoID: video.link });
        } catch (error) {
          cy.log('Error!')
        }
      });
    });
  });
});