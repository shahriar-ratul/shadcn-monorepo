import { tr } from 'zod/locales';
import axiosInstance from './axios';

export interface EmailPayload {
  txnRefNo: string;
  source: string;
  payload: {
    from: string;
    subject: string;
    to: string;
    cc?: string;
    bcc?: string;
    html?: string;
    text?: string;
  };
  additionalInfo: {
    template_id: number;
    isText: boolean;
    html_images?: Array<{ filename: string; base64: string }>;
    attachment_files?: Array<{ filename: string; base64: string }>;
  };
}

export const sendEmail = async (payload: EmailPayload) => {
 try {
   const response = await axiosInstance.post('/api/email/send', payload);
   console.log(response.data);
   return response.data;
 } catch (error: any) {
   console.error(error);
   throw new Error(error.response?.data?.message || error.message);
 }
};
