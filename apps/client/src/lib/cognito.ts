import {
  CognitoUserPool,
  ICognitoUserPoolData,
  CognitoUserSession,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  ISignUpResult,
  ICognitoUserAttributeData
} from 'amazon-cognito-identity-js';
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } from '@client/constants';

const poolData: ICognitoUserPoolData = {
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID
};

export const userPool = new CognitoUserPool(poolData);

let currentUser: CognitoUser | null = null;

export function getCognitoUser(username: string): CognitoUser {
  return new CognitoUser({
    Username: username,
    Pool: userPool
  });
}

export async function getSession() {
  if (!currentUser) {
    currentUser = userPool.getCurrentUser();
  }

  return new Promise<CognitoUserSession | Error | null>((resolve, reject) => {
    (currentUser as CognitoUser).getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      }
    );
  }).catch((err: Error) => {
    throw err;
  });
}

export async function getUserAttributes() {
  if (!currentUser) {
    currentUser = userPool.getCurrentUser();
  }

  return new Promise<any | Error | null | ICognitoUserAttributeData[]>((resolve, reject) => {
    (currentUser as CognitoUser).getUserAttributes((err, attributes) => {
      if (err) {
        reject(err);
      } else {
        resolve(attributes);
      }
    });
  }).catch((err: Error) => {
    throw err;
  });
}

export interface SignUpUserWithEmailPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

async function signUpUserWithEmailAndPassword(payload: SignUpUserWithEmailPayload) {
  return new Promise<ISignUpResult | Error | undefined>((resolve, reject) => {
    const { email, password, firstName, lastName, phoneNumber } = payload;

    const attributeGivenName = new CognitoUserAttribute({
      Name: 'given_name',
      Value: firstName
    });
    const attributeFamilyName = new CognitoUserAttribute({
      Name: 'family_name',
      Value: lastName
    });
    const attributeEmail = new CognitoUserAttribute({
      Name: 'email',
      Value: email
    });
    const attributePhoneNumber = new CognitoUserAttribute({
      Name: 'phone_number',
      Value: phoneNumber
    });

    const attributeList = [
      attributeEmail,
      attributePhoneNumber,
      attributeGivenName,
      attributeFamilyName
    ];

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

async function signInUserWithEmailAndPassword(email: string, password: string) {
  return new Promise<CognitoUserSession>((resolve, reject) => {
    const cognitoUser = getCognitoUser(email);

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

function signOutUser() {
  if (currentUser) {
    currentUser.signOut();
  }
}

async function confirmUserRegistration(userName: string, code: string) {
  return new Promise<any | Error>((resolve, reject) => {
    const cognitoUser = getCognitoUser(userName);
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

async function forgotUserPassword(username: string) {
  return new Promise<any | Error>((resolve, reject) => {
    const cognitoUser = getCognitoUser(username);
    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        resolve(data);
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

async function resendConfirmationCode(username: string) {
  return new Promise<any | Error>((resolve, reject) => {
    const cognitoUser = getCognitoUser(username);
    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

async function confirmUserPassword(username: string, code: string, newPassword: string) {
  return new Promise<string | Error>((resolve, reject) => {
    const cognitoUser = getCognitoUser(username);
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: (success) => {
        resolve(success);
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

async function changeUserPassword(oldPassword: string, newPassword: string) {
  if (!currentUser) {
    currentUser = userPool.getCurrentUser();
  }

  return new Promise<'SUCCESS' | Error | undefined>((resolve, reject) => {
    (currentUser as CognitoUser).changePassword(oldPassword, newPassword, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

async function changeUserEmail(oldEmail: string, newEmail: string) {
  if (!currentUser) {
    currentUser = userPool.getCurrentUser();
  }

  return new Promise<string | Error | undefined>((resolve, reject) => {
    (currentUser as CognitoUser).updateAttributes(
      [
        {
          Name: 'email',
          Value: newEmail
        }
      ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  }).catch((err) => {
    throw err;
  });
}

async function verifyUserNewEmail(code: string) {
  if (!currentUser) {
    currentUser = userPool.getCurrentUser();
  }

  return new Promise<string | Error | undefined>((resolve, reject) => {
    (currentUser as CognitoUser).verifyAttribute('email', code, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  }).catch((err) => {
    throw err;
  });
}

export default {
  getSession,
  getUserAttributes,
  signUpUserWithEmailAndPassword,
  signInUserWithEmailAndPassword,
  signOutUser,
  confirmUserRegistration,
  forgotUserPassword,
  resendConfirmationCode,
  confirmUserPassword,
  changeUserPassword,
  changeUserEmail,
  verifyUserNewEmail
};

export const CognitoError = {
  UserNotFoundException: 'UserNotFoundException',
  UserNotConfirmedException: 'UserNotConfirmedException',
  NotAuthorizedException: 'NotAuthorizedException',
  UsernameExistsException: 'UsernameExistsException',
  ExpiredCodeException: 'ExpiredCodeException',
  CodeMismatchException: 'CodeMismatchException',
  LimitExceededException: 'LimitExceededException'
};
