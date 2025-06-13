import config from "../../config/config";

export const verifyEmailMessage = (token?: string): string => {
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      h2 {
        color: #af3e3e;
      }

      p {
        color: #333;
        line-height: 1.6;
      }

      a.button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #af3e3e;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
      }

      a.button:hover {
        background-color: #9e2d30;
      }

      @media screen and (max-width: 600px) {
        .container {
          margin: 10px;
          border-radius: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Welcome to Mealify!</h2>
      <p>
        Thank you for signing up! To complete your registration, please click the button below to verify your email
        address:
      </p>

      <a href="${config.client_url}/auth/verify/email/${token}" class="button">Verify Email</a>

      <p>
        Thank you,<br />
        Mealify Team
      </p>
    </div>
  </body>
</html>`;
};

export const resetPasswordMessage = (code?: string): string => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mealify - Reset Password</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        color: #333;
        margin: 0;
        padding: 0;
        text-align: center;
      }
  
      header {
        background-color: #af3e3e;
        color: #fff;
        padding: 10px;
      }
  
      h1 {
        color: #af3e3e;
      }
  
      p {
        margin: 10px 0;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Mealify</h1>
    </header>
    <main>
      <h1>Reset Password</h1>
      <p>Your reset password code is ${code}.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    </main>
  </body>
  </html>
  `;
};
