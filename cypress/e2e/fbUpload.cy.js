const pageUrl = Cypress.env('PAGE_URL');
const filePath = Cypress.env('FILE_PATH');
import path from 'path';

describe('Facebook Login and Video Upload', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('Logs in through Facebook authentication', () => {
    // Enter login credentials
    cy.visit('https://www.facebook.com/');
    cy.get('input[id="email"]').type('devriousteam@gmail.com');
    cy.get('input[id="pass"]').type('Namikaze@1999/09/28');
    cy.contains('Log in').click();

    // cy.location('pathname').should('include', '/checkpoint/?next');
    cy.intercept('https://www.facebook.com/', {});
    cy.visit('https://www.facebook.com/profile.php?id=100086654302870');
    cy.contains('Reload Page').click();
    cy.contains('Switch Now').click();
    cy.wait(30000);

    cy.contains('Photo/video').scrollIntoView();
    cy.contains('Photo/video').click();
    const fullName = '7227054952634535169.mp4';
    const fpath = path.join(__dirname, 'downloads', fullName);
    cy.get('input[type=file]',{force: true}).eq(0).selectFile(fpath, { action: 'drag-drop' });



    // Assert successful authentication (customize this assertion)
    // cy.contains('Welcome to Facebook');
  });

  // it('Uploads a video file to a specific page', () => {
  //     // Navigate to the desired Facebook page (replace with your page URL)
  //     cy.visit(pageUrl);

  //     // // Select the file input element for uploading
  //     // cy.get('input[type="file"]').as('fileInput');

  //     // // Upload the video file (replace with your video file name)
  //     // const fullName = filename + '.mp4';
  //     // const fpath = path.resolve(__dirname, 'downloads', fullName);
  //     // const fileType = 'video/mp4';
  //     // cy.get('@fileInput').attachFile(fpath, { fileType });

  //     // // Assert successful upload (customize this assertion)
  //     // cy.contains('Your video has been uploaded successfully');
  // });
});