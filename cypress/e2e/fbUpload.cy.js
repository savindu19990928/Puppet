const pageUrl = Cypress.env('PAGE_URL');
const filePath = Cypress.env('FILE_PATH');

describe('Facebook Login and Video Upload', () => {
  beforeEach(() => {
    console.log("reer");
      cy.visit('https://www.facebook.com');
  });

  it('Logs in through Facebook authentication', () => {
      // Enter login credentials
      cy.origin('https://www.facebook.com', () => {
          cy.get('input[id="email"]').type(Cypress.env('devriousteam@gmail.com'));
          cy.get('input[id="pass"]').type(Cypress.env('Namikaze@1999/09/28'));
          cy.get('button[id="loginbutton"]').click();
      });

      // Assert successful authentication (customize this assertion)
      // cy.contains('Welcome to Facebook');
  });

  it('Uploads a video file to a specific page', () => {
      // Navigate to the desired Facebook page (replace with your page URL)
      cy.visit(pageUrl);

      // // Select the file input element for uploading
      // cy.get('input[type="file"]').as('fileInput');

      // // Upload the video file (replace with your video file name)
      // const fullName = filename + '.mp4';
      // const fpath = path.resolve(__dirname, 'downloads', fullName);
      // const fileType = 'video/mp4';
      // cy.get('@fileInput').attachFile(fpath, { fileType });

      // // Assert successful upload (customize this assertion)
      // cy.contains('Your video has been uploaded successfully');
  });
});