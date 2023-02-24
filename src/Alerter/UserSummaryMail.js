const moment = require('moment');
const _ = require('lodash');

/*
  Embedded Variables:

  date: Oct 20, 2019 - Nov 2, 2019

  content:
    <div>Total Users: 42</div>
    <div>New Users: 24</div>
*/

function createBasicHTML(startDate, endDate, totalUsers, newUsers) {

    const date = `<div>${startDate.format('ll')} &mdash; ${endDate.format('ll')}</div>`;
    const content = `<div>Total Users: ${totalUsers}</div><div>New Users: ${newUsers}</div>`;

    const html = `
    <!doctype html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <title>
          Weekly User Summary
        </title>
        <!--[if !mso]><!-- -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
          #outlook a { padding:0; }
          .ReadMsgBody { width:100%; }
          .ExternalClass { width:100%; }
          .ExternalClass * { line-height:100%; }
          body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
          table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
          img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
          p { display:block;margin:13px 0; }
        </style>
        <!--[if !mso]><!-->
        <style type="text/css">
          @media only screen and (max-width:480px) {
            @-ms-viewport { width:320px; }
            @viewport { width:320px; }
          }
        </style>
        <!--<![endif]-->
        <!--[if mso]>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <!--[if lte mso 11]>
        <style type="text/css">
          .outlook-group-fix { width:100% !important; }
        </style>
        <![endif]-->

      <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css">
        <style type="text/css">
          @import url(https://fonts.googleapis.com/css?family=Lato);
        </style>
      <!--<![endif]-->



    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 { width:100% !important; max-width: 100%; }
      }
    </style>


        <style type="text/css">



    @media only screen and (max-width:480px) {
      table.full-width-mobile { width: 100% !important; }
      td.full-width-mobile { width: auto !important; }
    }

        </style>
        <style type="text/css">.main { padding:20px 10px !important; }
      .link { padding-top: 8px; }
      .link a { color: #729BFF; display: inline-block; font-variant: small-caps; padding-left: 5px; text-decoration: none; }
      .list { padding: 0 25px 25px; margin: 0 }
      .logo { margin-top: -50px !important; }
      .title div { padding-top: 5px !important; }</style>

      </head>
      <body style="background-color:#414141;">

    <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      Weekly User Summary
    </div>


      <div
         class="main" style="background-color:#414141;"
      >


      <!--[if mso | IE]>
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->


      <div  style="background:#414141;background-color:#414141;Margin:0px auto;max-width:600px;">

        <table
           align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#414141;background-color:#414141;width:100%;"
        >
          <tbody>
            <tr>
              <td
                 style="direction:ltr;font-size:0px;padding:20px 0 10px 0;text-align:center;vertical-align:top;"
              >
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">

        <tr>

        </tr>

                  </table>
                <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>

      </div>


      <!--[if mso | IE]>
          </td>
        </tr>
      </table>

      <table
         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->


      <div  style="background:#1d2948;background-color:#1d2948;Margin:0px auto;border-radius:4px 4px 0 0;max-width:600px;">

        <table
           align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#1d2948;background-color:#1d2948;width:100%;border-radius:4px 4px 0 0;"
        >
          <tbody>
            <tr>
              <td
                 style="direction:ltr;font-size:0px;padding:5px 10px 15px 10px;text-align:center;vertical-align:top;"
              >
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">

        <tr>

            <td
               class="" style="vertical-align:top;width:580px;"
            >
          <![endif]-->

      <div
         class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
      >

      <table
         border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
      >
        <tbody>
          <tr>
            <td  style="vertical-align:top;padding:0;">

      <table
         border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%"
      >

            <tr>
              <td
                 align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"
              >

      <table
         border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"
      >
        <tbody>
          <tr>
            <td  style="width:200px;">

      <img
         height="auto" src="https://myrecalls.today/mail-logo-280x86.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;" title="myRecalls" width="200"
      />

            </td>
          </tr>
        </tbody>
      </table>

              </td>
            </tr>

            <tr>
              <td
                 align="center" style="font-size:0px;padding:0;word-break:break-word;"
              >

      <div
         style="font-family:Lato, Helvetica, Arial, sans-serif;font-size:18px;font-weight:500;line-height:24px;text-align:center;color:#ffffff;"
      >
        Weekly User Summary
          <div>${date}</div>
      </div>
    
              </td>
            </tr>
          
      </table>
    
            </td>
          </tr>
        </tbody>
      </table>
    
      </div>
    
          <!--[if mso | IE]>
            </td>
          
        </tr>
      
                  </table>
                <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    
      
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->
    
      
      <div  style="background:#ffffff;background-color:#ffffff;Margin:0px auto;border-radius:0 0 4px 4px;max-width:600px;">
        
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;border-radius:0 0 4px 4px;"
        >
          <tbody>
            <tr>
              <td
                 style="direction:ltr;font-size:0px;padding:0;text-align:center;vertical-align:top;"
              >
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                
        <tr>
      
            <td
               class="" style="vertical-align:top;width:600px;"
            >
          <![endif]-->
            
      <div
         class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
      >
        
      <table
         border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
      >
        <tbody>
          <tr>
            <td  style="vertical-align:top;padding:10px;">
              
      <table
         border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%"
      >
        
            <tr>
              <td
                 align="left" style="font-size:0px;padding:0;word-break:break-word;"
              >
                
      <div
         style="font-family:Lato, Helvetica, Arial, sans-serif;font-size:16px;font-weight:300;line-height:20px;text-align:left;color:#000000;"
      >
        ${content}
      </div>
    
              </td>
            </tr>
          
            <tr>
              <td
                 align="right" vertical-align="middle" class="body-text" style="font-size:0px;padding:0;word-break:break-word;"
              >
                
      <table
         border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"
      >
        <tr>
          <td
             align="center" bgcolor="#ffffff" role="presentation" style="border:1px solid #729BFF;border-radius:3px;cursor:auto;padding:8px;background:#ffffff;" valign="middle"
          >
            <a
               href="https://myrecalls.today/users" style="background:#ffffff;color:#729BFF;font-family:Lato, Helvetica, Arial, sans-serif;font-size:14px;font-weight:300;line-height:16px;Margin:0;text-decoration:none;text-transform:uppercase;" target="_blank"
            >
              All Users
            </a>
          </td>
        </tr>
      </table>
    
              </td>
            </tr>
          
      </table>
    
            </td>
          </tr>
        </tbody>
      </table>
    
      </div>
    
          <!--[if mso | IE]>
            </td>
          
        </tr>
      
                  </table>
                <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    
      
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->
    
      
      <div  style="background:#414141;background-color:#414141;Margin:0px auto;max-width:600px;">
        
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#414141;background-color:#414141;width:100%;"
        >
          <tbody>
            <tr>
              <td
                 style="direction:ltr;font-size:0px;padding:10px;text-align:center;vertical-align:top;"
              >
                <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                
        <tr>
      
            <td
               class="" style="vertical-align:top;width:580px;"
            >
          <![endif]-->
            
      <div
         class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
      >
        
      <table
         border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
      >
        <tbody>
          <tr>
            <td  style="vertical-align:top;padding:0 5px;">
              
      <table
         border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%"
      >
        
            <tr>
              <td
                 align="center" style="font-size:0px;padding:25px 0 0 0;word-break:break-word;"
              >
                
      <div
         style="font-family:Lato, Helvetica, Arial, sans-serif;font-size:12px;font-weight:300;line-height:16px;text-align:center;color:#FFFFFF;"
      >
        myRecalls delivers timely notifications of product and vehicle recalls to keep you and your family safe.
      </div>
    
              </td>
            </tr>
          
            <tr>
              <td
                 align="center" style="font-size:0px;padding:5px 0 0 0;word-break:break-word;"
              >
                
      <div
         style="font-family:Lato, Helvetica, Arial, sans-serif;font-size:12px;font-weight:300;line-height:16px;text-align:center;color:#FFFFFF;"
      >
        You received this email because you have a subscription with myRecalls.
      </div>
    
              </td>
            </tr>
          
            <tr>
              <td
                 align="center" style="font-size:0px;padding:15px 0 0 0;word-break:break-word;"
              >
                
      <div
         style="font-family:Lato, Helvetica, Arial, sans-serif;font-size:12px;font-weight:300;line-height:16px;text-align:center;color:#FFFFFF;"
      >
        Learn more at <a style="color: #FFFFFF" href="https://myrecalls.today/">https://myrecalls.today/</a><br/>
          Update settings at <a style="color: #FFFFFF" href="https://myrecalls.today/settings/">https://myrecalls.today/settings/</a><br/>
          Contact us at <a style="color: #FFFFFF" href="mailto:info@myrecalls.today">info@myrecalls.today</a>
      </div>
    
              </td>
            </tr>
          
      </table>
    
            </td>
          </tr>
        </tbody>
      </table>
    
      </div>
    
          <!--[if mso | IE]>
            </td>
          
        </tr>
      
                  </table>
                <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    
      
      <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      <![endif]-->
    
    
      </div>
    
      </body>
    </html>
    `;
    return html;
}

function createBasicPlain(startDate, endDate, totalUsers, newUsers) {
    const date = `${startDate.format('ll')} - ${endDate.format('ll')}`;
    const plain =
        `
Weekly User Summary

${_.repeat('-', 80)}
${date}

Total Users: ${totalUsers}
New Users: ${newUsers}

https://myrecalls.today/users

${_.repeat('-', 80)}
`;
    return plain;
}

module.exports.createBasicHTML = createBasicHTML;
module.exports.createBasicPlain = createBasicPlain
