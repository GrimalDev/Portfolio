import { exec } from 'child_process';

export function gitFetchHandler(req, res, next) {
  //execute git command to rebase project from github as a process in the background in the container
  exec('git fetch --all && git reset --hard origin/master', (err stdout, stderr) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Project updated');
    }
  });
  res.status(202).send('Accepted');
}