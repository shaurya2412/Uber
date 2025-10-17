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
    name: process.env.COMPANY_NAME || 'Uber Clone',
    email: process.env.COMPANY_EMAIL || 'support@uberclone.com',
    address: process.env.COMPANY_ADDRESS || 'Noida, India'
  };

  const company = companyInfo || defaultCompanyInfo;

  return `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee;">
      <div style="display: flex; align-items: center;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" width="70" style="margin-right: 15px;">
        <div>
          <strong>${company.name}</strong><br/>
          <span style="font-size: 13px;">${company.address}</span>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 26px; font-weight: bold;">₹${fare}</div>
        <div style="font-size: 13px; color: #555;">${paymentMethod}</div>
        <div style="font-size: 13px; color: #555;">${date}</div>
        <div style="font-size: 11px; color: #999;">Receipt: ${receiptNo}</div>
      </div>
    </div>

    <div style="padding: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0;">
            <strong>Pick-up</strong><br/>
            <span style="color: #555;">${pickup}</span>
          </td>
          <td style="padding: 5px 0;">
            <strong>Drop-off</strong><br/>
            <span style="color: #555;">${drop}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong>Car</strong><br/>
            <span style="color: #555;">${carType}</span>
          </td>
          <td style="padding: 5px 0;">
            <strong>Duration</strong><br/>
            <span style="color: #555;">${duration}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong>Distance</strong><br/>
            <span style="color: #555;">${distance} km</span>
          </td>
          <td style="padding: 5px 0;">
            <strong>Map</strong><br/>
            <img src="${mapUrl}" alt="Trip map" width="220" style="border-radius: 6px; margin-top: 4px;">
          </td>
        </tr>
      </table>
    </div>

    ${captainInfo ? `
    <div style="padding: 15px 20px; border-top: 1px solid #eee; background-color: #f8f9fa;">
      <h4 style="margin: 0 0 10px 0; font-size: 16px;">Your Driver</h4>
      <div style="display: flex; align-items: center;">
        <div style="width: 40px; height: 40px; background-color: #ddd; border-radius: 50%; margin-right: 10px; display: flex; align-items: center; justify-content: center;">
          <span style="font-weight: bold;">${captainInfo.name && typeof captainInfo.name === 'string' && captainInfo.name.length > 0 ? captainInfo.name.charAt(0).toUpperCase() : 'D'}</span>
        </div>
        <div>
          <div style="font-weight: bold;">${captainInfo.name && typeof captainInfo.name === 'string' ? captainInfo.name : 'Driver'}</div>
          <div style="font-size: 13px; color: #555;">${captainInfo.vehicleNumber && typeof captainInfo.vehicleNumber === 'string' ? captainInfo.vehicleNumber : 'Vehicle Info'}</div>
          <div style="font-size: 13px; color: #555;">Rating: ${captainInfo.rating && typeof captainInfo.rating === 'number' ? captainInfo.rating.toFixed(1) : '4.5'} ⭐</div>
        </div>
      </div>
    </div>
    ` : ''}

    <div style="padding: 15px 20px; border-top: 1px solid #eee;">
      <h4 style="margin: 0 0 15px 0; font-size: 16px;">Fare Breakdown</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">Base fare</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">₹${breakdown.baseFare}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">Distance (${distance} km)</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">₹${breakdown.distanceFare}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">Time (${duration})</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">₹${breakdown.timeFare}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">Taxes & Fees</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">₹${breakdown.taxes}</td>
        </tr>
        <tr style="font-weight: bold; font-size: 16px;">
          <td style="padding: 12px 0;">Total</td>
          <td style="padding: 12px 0; text-align: right;">₹${breakdown.total}</td>
        </tr>
      </table>
    </div>

    <div style="padding: 15px 20px; background-color: #f8f9fa; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
      <div style="margin-bottom: 8px;">
        <strong>${company.name}</strong> | ${company.email}
      </div>
      <div>
        © 2025 ${company.name} Technologies Pvt. Ltd. | All rights reserved.
      </div>
      <div style="margin-top: 8px; font-size: 11px;">
        Need help? Contact us at ${company.email}
      </div>
    </div>
  </div>
  `;
}

module.exports = { generateTripReceiptHTML };
