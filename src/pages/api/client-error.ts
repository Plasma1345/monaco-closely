import type { NextApiRequest, NextApiResponse } from 'next';
import { reportClientError } from '@/lib/errorReporter';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false });
    return;
  }
  reportClientError(req.body);
  res.status(200).json({ ok: true });
}
