import axios from 'axios';

export const sendOtp = async (phoneNumber: string, otp: string) => {
  try{
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        sender_id: 'FSTSMS',
        message: `Your OTP is ${otp}`,
        language: 'english',
        route: 'q',
        numbers: phoneNumber,
      }, {
        headers: {
          'Authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type':'application/json',
        },
      });
      console.log(`Sent OTP ${otp} to phone number ${phoneNumber}`);
      return response.data;
  }
  catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
    }
};