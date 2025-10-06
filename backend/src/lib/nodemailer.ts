import nodemailer, { Transporter } from 'nodemailer';
import config from '@/config/envValidation';
import { APIError } from '@/utils/apiError';
import logger from './logger';

let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.EMAIL_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GMAIL_REFRESH_TOKEN,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        logger.error('Error configuring email transporter', error);
        throw new APIError(500, 'Failed to configure email transporter');
      }
      if (success) {
        logger.info('Email transporter is configured and ready to send emails');
      }
    });
  }

  return transporter;
}
