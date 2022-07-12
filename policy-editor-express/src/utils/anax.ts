import { Observable } from 'rxjs';
import { shell, isSha256, privateKey, publicKey } from '../utility';

export const anax: any = {
  signDeployment: (privatKey: string, deploymentHash: string): Observable<any> => {
    const arg = isSha256(deploymentHash) ?
      `echo ${deploymentHash} | hzn util sign -k ${privatKey} -v` :
      `cat ${deploymentHash} | hzn util sign -k ${privatKey} -v`
    return shell(arg);
  },
  createPublicPrivateKey: (privateKeyName = privateKey, publicKeyName = publicKey, org = 'IEAM', email = 'ieam@ibm.com'): Observable<any> => {
    const arg = `hzn key create -k ${privateKeyName} -K ${publicKeyName} ${org} ${email}`
    return shell(arg);
  }
}
