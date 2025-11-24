// utils/receiptTemplate.js
function generateTripReceiptHTML(tripData) {
  const {
    user,
    tripId,
    pickup,
    drop,
    fare,
    distance,
    duration,
    carType,
    paymentMethod,
    receiptNo,
    mapUrl,
    date,
    fareBreakdown,
    companyInfo,
    captainInfo
  } = tripData;

  // Default fare breakdown if not provided
  const defaultFareBreakdown = {
    baseFare: Math.round(fare * 0.4),
    distanceFare: Math.round(fare * 0.5),
    timeFare: Math.round(fare * 0.05),
    taxes: Math.round(fare * 0.05),
    total: fare
  };

  const breakdown = fareBreakdown || defaultFareBreakdown;

  // Default company info if not provided
  const defaultCompanyInfo = {
    name: process.env.COMPANY_NAME || 'Rahi',
    email: process.env.COMPANY_EMAIL || 'support@rahi.com',
    address: process.env.COMPANY_ADDRESS || 'Noida, India'
  };

  const company = companyInfo || defaultCompanyInfo;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 25px; color: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 5px; letter-spacing: -0.5px;">${company.name}</div>
            <div style="font-size: 12px; color: #b0b0b0; letter-spacing: 0.5px;">TRIP RECEIPT</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 32px; font-weight: 700; margin-bottom: 5px;">₹${typeof fare === 'number' ? fare.toFixed(2) : fare}</div>
            <div style="font-size: 11px; color: #b0b0b0;">Receipt #${receiptNo}</div>
          </div>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; display: flex; justify-content: space-between; font-size: 12px; color: #d0d0d0;">
          <div>
            <div style="color: #b0b0b0; margin-bottom: 3px;">Date & Time</div>
            <div>${date}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #b0b0b0; margin-bottom: 3px;">Payment Method</div>
            <div>${paymentMethod}</div>
          </div>
        </div>
      </div>

      <!-- Trip Details Section -->
      <div style="padding: 25px; border-bottom: 1px solid #e8eaed;">
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <div style="width: 12px; height: 12px; background-color: #10b981; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
            <div style="flex: 1;">
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">Pick-up Location</div>
              <div style="font-size: 15px; color: #111827; line-height: 1.5; font-weight: 500;">${pickup}</div>
            </div>
          </div>
          <div style="width: 2px; height: 20px; background: linear-gradient(to bottom, #10b981, #ef4444); margin-left: 5px; margin-bottom: 15px;"></div>
          <div style="display: flex; align-items: flex-start;">
            <div style="width: 12px; height: 12px; background-color: #ef4444; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
            <div style="flex: 1;">
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">Drop-off Location</div>
              <div style="font-size: 15px; color: #111827; line-height: 1.5; font-weight: 500;">${drop}</div>
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e8eaed;">
          <div>
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Vehicle</div>
            <div style="font-size: 14px; color: #111827; font-weight: 500;">${carType}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Trip Duration</div>
            <div style="font-size: 14px; color: #111827; font-weight: 500;">${duration}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Distance</div>
            <div style="font-size: 14px; color: #111827; font-weight: 500;">${typeof distance === 'number' ? distance.toFixed(2) : distance} km</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Trip ID</div>
            <div style="font-size: 14px; color: #111827; font-weight: 500; font-family: monospace;">${tripId}</div>
          </div>
        </div>
      </div>

      ${captainInfo ? `
      <!-- Driver Information Section -->
      <div style="padding: 25px; background-color: #f9fafb; border-bottom: 1px solid #e8eaed;">
        <div style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; font-weight: 600;">Your Driver</div>
        <div style="display: flex; align-items: center; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e8eaed;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span style="font-weight: 700; font-size: 20px; color: #ffffff;">${captainInfo.name && typeof captainInfo.name === 'string' && captainInfo.name.length > 0 ? captainInfo.name.charAt(0).toUpperCase() : 'D'}</span>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 4px;">${captainInfo.name && typeof captainInfo.name === 'string' ? captainInfo.name : 'Driver'}</div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 2px;">${captainInfo.vehicleInfo && typeof captainInfo.vehicleInfo === 'string' ? captainInfo.vehicleInfo : 'Vehicle'}</div>
            <div style="font-size: 13px; color: #6b7280; font-family: monospace;">${captainInfo.vehicleNumber && typeof captainInfo.vehicleNumber === 'string' ? captainInfo.vehicleNumber : 'N/A'}</div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 2px;">${captainInfo.rating && typeof captainInfo.rating === 'number' ? captainInfo.rating.toFixed(1) : '4.5'}</div>
            <div style="font-size: 11px; color: #6b7280;">Rating</div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Fare Breakdown Section -->
      <div style="padding: 25px;">
        <div style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; font-weight: 600;">Fare Breakdown</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8eaed; font-size: 14px; color: #6b7280;">Base Fare</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8eaed; text-align: right; font-size: 14px; color: #111827; font-weight: 500;">₹${typeof breakdown.baseFare === 'number' ? breakdown.baseFare.toFixed(2) : breakdown.baseFare}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8eaed; font-size: 14px; color: #6b7280;">Distance (${typeof distance === 'number' ? distance.toFixed(2) : distance} km)</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8eaed; text-align: right; font-size: 14px; color: #111827; font-weight: 500;">₹${typeof breakdown.distanceFare === 'number' ? breakdown.distanceFare.toFixed(2) : breakdown.distanceFare}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8eaed; font-size: 14px; color: #6b7280;">Time (${duration})</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8eaed; text-align: right; font-size: 14px; color: #111827; font-weight: 500;">₹${typeof breakdown.timeFare === 'number' ? breakdown.timeFare.toFixed(2) : breakdown.timeFare}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8eaed; font-size: 14px; color: #6b7280;">Taxes & Fees</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e8eaed; text-align: right; font-size: 14px; color: #111827; font-weight: 500;">₹${typeof breakdown.taxes === 'number' ? breakdown.taxes.toFixed(2) : breakdown.taxes}</td>
          </tr>
          <tr>
            <td style="padding: 18px 0 0 0; font-size: 16px; font-weight: 700; color: #111827;">Total Amount</td>
            <td style="padding: 18px 0 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #111827;">₹${typeof breakdown.total === 'number' ? breakdown.total.toFixed(2) : breakdown.total}</td>
          </tr>
        </table>
      </div>

      <!-- Footer Section -->
      <div style="padding: 20px 25px; background-color: #f9fafb; border-top: 1px solid #e8eaed; text-align: center;">
        <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
          <div style="margin-bottom: 8px;">
            <strong style="color: #111827;">${company.name}</strong><br/>
            <span>${company.address}</span>
          </div>
          <div style="margin-bottom: 8px;">
            <a href="mailto:${company.email}" style="color: #2563eb; text-decoration: none;">${company.email}</a>
          </div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e8eaed;">
            © ${new Date().getFullYear()} ${company.name} Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = { generateTripReceiptHTML };
