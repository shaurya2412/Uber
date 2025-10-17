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
  } = tripData;

  return `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee;">
      <div style="display: flex; align-items: center;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" width="70" style="margin-right: 15px;">
        <div>
          <strong>Uber Technologies, Inc</strong><br/>
          <span style="font-size: 13px;">1455 Market Street<br/>San Francisco, CA 94103</span>
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

    <div style="padding: 15px 20px; border-top: 1px solid #eee; text-align: right; font-weight: bold;">
      Total: ₹${fare}
    </div>
  </div>
  `;
}

module.exports = { generateTripReceiptHTML };
