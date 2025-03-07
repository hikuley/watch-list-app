import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'jessica67@ethereal.email',
                pass: '6s2TDQH8Vk3rNpsny5',
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