import { defineMiddleware } from 'astro:middleware';

// Authentication credentials
const SITE_USERNAME = 'vra-member';
const SITE_PASSWORD = 'seniors2024';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;
  const pathname = url.pathname;

  // Skip authentication for static assets
  if (pathname.startsWith('/_astro/') || 
      pathname.startsWith('/favicon') || 
      pathname.endsWith('.js') || 
      pathname.endsWith('.css') || 
      pathname.endsWith('.svg') || 
      pathname.endsWith('.png') || 
      pathname.endsWith('.jpg') || 
      pathname.endsWith('.jpeg') || 
      pathname.endsWith('.gif') || 
      pathname.endsWith('.ico')) {
    return next();
  }

  // Check for authentication header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Required - VRA Seniors</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #065f46 0%, #047857 100%);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 12px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 400px;
              margin: 1rem;
            }
            h1 { color: #065f46; margin-bottom: 1rem; }
            p { color: #6b7280; margin-bottom: 1.5rem; }
            .logo { color: #065f46; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">VRA Golf Club - Seniors Section</div>
            <h1>Members Only Access</h1>
            <p>This website is restricted to VRA Seniors Section members only. Please contact the committee for access credentials.</p>
            <p><strong>Email:</strong> vra.seniors@gmail.com</p>
          </div>
        </body>
        </html>
      `;
    
    return new Response(htmlContent, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="VRA Seniors Website"',
        'Content-Type': 'text/html',
      }
    });
  }

  // Decode the base64 credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Check admin access for /admin routes
  if (pathname.startsWith('/admin')) {
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      const adminHtmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Admin Access Required - VRA Seniors</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                margin: 1rem;
              }
              h1 { color: #dc2626; margin-bottom: 1rem; }
              p { color: #6b7280; margin-bottom: 1.5rem; }
              .logo { color: #dc2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">🔒 Admin Access</div>
              <h1>Administrator Login Required</h1>
              <p>This area requires administrator credentials. Please contact the website administrator for access.</p>
            </div>
          </body>
          </html>
        `;
      
      return new Response(adminHtmlContent, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="VRA Seniors Admin"',
          'Content-Type': 'text/html',
        }
      });
    }
  } else {
    // Check general site access
    if (username !== SITE_USERNAME || password !== SITE_PASSWORD) {
      const deniedHtmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Access Denied - VRA Seniors</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #065f46 0%, #047857 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                margin: 1rem;
              }
              h1 { color: #dc2626; margin-bottom: 1rem; }
              p { color: #6b7280; margin-bottom: 1.5rem; }
              .logo { color: #065f46; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">VRA Golf Club - Seniors Section</div>
              <h1>Invalid Credentials</h1>
              <p>The username or password you entered is incorrect. Please try again or contact the committee for assistance.</p>
              <p><strong>Email:</strong> vra.seniors@gmail.com</p>
            </div>
          </body>
          </html>
        `;
      
      return new Response(deniedHtmlContent, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="VRA Seniors Website"',
          'Content-Type': 'text/html',
        }
      });
    }
  }

  // Authentication successful, proceed to the requested page
  return next();
});