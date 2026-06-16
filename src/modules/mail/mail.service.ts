import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';

import { TemplateLoader } from './utils/template-loader';

import { SendMailOptions } from './interfaces/send-mail.interface';
import { MailSubjects } from './constants/mail-subjects';

@Injectable()
export class MailService {
  private readonly logger =
    new Logger(MailService.name);

  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.transporter =
      nodemailer.createTransport({
        host:
          this.configService.get<string>(
            'MAIL_HOST',
          ),

        port: Number(
          this.configService.get<string>(
            'MAIL_PORT',
          ),
        ),

        secure: false,

        auth: {
          user:
            this.configService.get<string>(
              'MAIL_USER',
            ),

          pass:
            this.configService.get<string>(
              'MAIL_PASSWORD',
            ),
        },
      });
  }

  async sendMail(
    options: SendMailOptions,
  ) {
    const html =
      TemplateLoader.load(
        options.template,
        options.context,
      );

    await this.transporter.sendMail({
      from:
        this.configService.get<string>(
          'MAIL_FROM',
        ),

      to: options.to,

      subject: options.subject,

      html,
    });

    this.logger.log(
      `Email sent to ${options.to}`,
    );
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetLink: string,
  ) {
    await this.sendMail({
      to: email,

      subject: MailSubjects.RESET_PASSWORD,

      template: 'auth/forgot-password',

      context: {
        firstName,
        resetLink,
        year: new Date().getFullYear(),
      },
    });
  }


  
}