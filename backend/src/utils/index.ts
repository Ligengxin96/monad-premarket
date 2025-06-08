import dayjs from 'dayjs';
import { customAlphabet } from 'nanoid';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateOrderId = (length = 18, placeholder = '1234567890') => {
  const customNanoid = customAlphabet(placeholder, length);
  return dayjs().format('YYYYMMDDHHmmss') + customNanoid();
}