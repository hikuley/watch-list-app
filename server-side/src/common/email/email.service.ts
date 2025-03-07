import {Injectable} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {

        const host: string | undefined = this.configService.get<string>('EMAIL_HOST');
        const user: string | undefined = this.configService.get<string>('EMAIL_USER');
        const password: string | undefined = this.configService.get<string>('EMAIL_PASSWORD');
        const port: number | undefined = this.configService.get<number>('EMAIL_PORT');

        this.transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: false, // true for 465, false for other ports
            auth: {
                user: user,
                pass: password,
            },
        });
    }

    public async sendMail(to: string, subject: string, text: string, html?: string) {
        const mailOptions = {
            from: 'info@watchlist.com',
            to,
            subject,
            text,
            html: html || text,
        };

        return this.transporter.sendMail(mailOptions);
    }
}