import { Observable } from 'rxjs';
import { shell, isSha256 } from '../utility';

export const anax: any = {
  signDeployment: (privatKey: string, deploymentHash: string): Observable<any> => {
    const arg = isSha256(deploymentHash) ?
      `echo ${deploymentHash} | hzn util sign -k ${privatKey}` :
      `cat ${deploymentHash} | hzn util sign -k ${privatKey}`
    return shell(arg);
  }
}
