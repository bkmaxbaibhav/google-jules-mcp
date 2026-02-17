import { verify } from "otplib";
import environments from "../../environments";
import { sessionService } from "../services/session.service";

export async function authenticate(payload: { otp: string }) {
    const { otp } = payload;
    const secret = environments.mcp.totpSecret;

    // Clean OTP input (remove spaces)
    const cleanOtp = otp.replace(/\s/g, "");
    try {
        const result = await verify({
            token: cleanOtp,
            secret,
            strategy: "totp"
        });
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
    } catch (error) {
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
