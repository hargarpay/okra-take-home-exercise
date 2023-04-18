import crypto from 'crypto';

export const encrypted = (data: string): string => {
    return crypto.createHash('md5').update(data).digest('hex');
}