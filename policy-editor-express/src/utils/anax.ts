import { Observable } from 'rxjs';
import { shell, isSha256, privateKey, publicKey } from '../utility';

export const anax: any = {
  signDeployment: (privatKey: string, deployment: string): Observable<any> => {
    const arg = `echo ${deployment} | hzn util sign -k ${privatKey}`
    return shell(arg);
  },
  signDeploymentWithHash: (privatKey: string, deploymentHash: string): Observable<any> => {
    const arg = isSha256(deploymentHash) ?
      `echo ${deploymentHash} | hzn util sign -k ${privatKey} -v` :
      `cat ${deploymentHash} | hzn util sign -k ${privatKey} -v`
    return shell(arg);
  },
  createPublicPrivateKey: (privateKeyName = privateKey, publicKeyName = publicKey, org = 'IEAM', email = 'ieam@ibm.com'): Observable<any> => {
    const arg = `hzn key create -k ${privateKeyName} -K ${publicKeyName} ${org} ${email}`
    return shell(arg, 'done creating keys', 'failed to create keys', false);
  },
  publishService: (service: any) => {
    let json = JSON.stringify(service.json)
    console.log(json)
    const arg = `echo ${json} | hzn exchange service publish -O ${service.credentials} -f- -P -o ${service.org} -u ${service.userPw}`;
    return shell(arg, 'done publishing service', 'failed to publish service');
  }
}
