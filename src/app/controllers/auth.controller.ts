import { TOTP } from "otplib";
import environments from "../../environments";
import { sessionService } from "../services/session.service";

export async function authenticate(payload: { otp: string }) {
    const { otp } = payload;
    const secret = environments.mcp.totpSecret;

    const totp = new TOTP();
    const result = await totp.verify(otp, { secret });

    if (result.valid) {
        sessionService.authenticate();
        return {
            content: [
                {
                    type: "text",
                    text: `Authentication successful! Your session is now valid for the next 30 minutes.`
                }
            ]
        };
    } else {
        return {
            content: [
                {
                    type: "text",
                    text: `Invalid OTP. Please try again.`
                }
            ],
            isError: true
        };
    }
}
