require('dotenv').config();
const axios = require('axios');

async function testEmail() {
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.EMAIL_TO;

    console.log("=== TEST EMAIL VIA RESEND ===");
    console.log("API Key:", resendApiKey ? resendApiKey.substring(0, 10) + "..." : "NOT SET");
    console.log("Email To:", emailTo || "NOT SET");

    if (!resendApiKey || !emailTo) {
        console.error("ERROR: RESEND_API_KEY atau EMAIL_TO belum diset di .env");
        return;
    }

    try {
        const response = await axios.post('https://api.resend.com/emails', {
            from: 'TelJobs Bot <onboarding@resend.dev>',
            to: [emailTo],
            subject: '🔍 TEST - TelJobs Email Notification',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px 12px 0 0;">
                        <h2 style="color: white; margin: 0;">🔍 TelJobs — Test Email</h2>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
                        <p>✅ <b>Email berhasil dikirim!</b></p>
                        <p>Kalau kamu baca ini, berarti notifikasi email TelJobs berfungsi dengan baik.</p>
                        <p>Waktu kirim: ${new Date().toLocaleString('id-ID')}</p>
                    </div>
                    <p style="color: #6c757d; font-size: 12px; text-align: center; margin-top: 15px;">Dikirim oleh TelJobs Scraper</p>
                </div>
            `
        }, {
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("\n✅ Email berhasil dikirim!");
        console.log("Resend ID:", response.data.id);
        console.log("\nCek inbox Gmail kamu:", emailTo);
        console.log("Cek juga folder Spam dan tab Promotions/Social");
    } catch (error) {
        console.error("\n❌ Gagal kirim email!");
        console.error("Error:", error.response?.data || error.message);
    }
}

testEmail();
