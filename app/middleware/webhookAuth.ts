import crypto from 'crypto';

export default function webhookAuth(req, res, next) {
  //check if the request comes from github (with prefix GitHub-Hookshot/)
  if (req.headers['user-agent'].startsWith('GitHub-Hookshot/')) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }

  //verify if the signature header is present
  if (!req.headers['X-Signature-SHA256']) {
    res.status(401).send('Unauthorized');
  }

  //check the request signature

  //calculate hmac
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_TOKEN);
  const signature = hmac.update(JSON.stringify(req.body)).digest('hex');

  //compare signatures
  if (req.headers['X-Signature-SHA256'] === `sha256=${signature}`) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}