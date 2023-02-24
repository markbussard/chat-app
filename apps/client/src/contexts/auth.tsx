import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CognitoUserSession, ISignUpResult } from 'amazon-cognito-identity-js';
import { toast } from 'react-hot-toast';
import { AuthStatus } from '@client/constants';
import cognito, { SignUpUserWithEmailPayload, CognitoError } from '@client/lib/cognito';
import { User } from '@chat-app/shared-types';
import { socket } from '@client/lib/socket';
import { LinearProgress } from '@client/components';

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

type Auth = {
  getUserSession: () => Promise<Error | CognitoUserSession | null | undefined>;
  signInUserWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signUpUserWithEmailAndPassword: (
    payload: SignUpUserWithEmailPayload
  ) => Promise<Error | ISignUpResult | undefined>;
  confirmUserRegistration: (email: string, code: string, hasPassword?: boolean) => Promise<void>;
  signOutUser: () => void;
  resendConfirmationCode: (email: string) => Promise<void>;
  forgotUserPassword: (email: string) => Promise<void>;
  confirmUserPassword: (email: string, code: string, password: string) => Promise<void>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<void>;
  changeUserEmail: (oldEmail: string, newEmail: string) => Promise<void>;
  verifyUserNewEmail: (code: string) => Promise<void>;
  session: AuthSession;
  status: AuthStatus;
  setSession: React.Dispatch<React.SetStateAction<AuthSession>>;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthContext = createContext<Auth | Record<string, never>>({});

export const AuthProvider = (props: AuthProviderProps) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.Loading);
  const [session, setSession] = useState<AuthSession>({} as AuthSession);

  useEffect(() => {
    async function checkIfUserIsSignedIn() {
      try {
        // Will throw an error if user is not signed in
        const cognitoUser = (await cognito.getSession()) as CognitoUserSession;
        const accessToken = cognitoUser.getAccessToken().getJwtToken();
        const refreshToken = cognitoUser.getRefreshToken().getToken();
        setSession(() => ({
          accessToken,
          refreshToken,
          user: {} as User
        }));

        socket.connect();
        socket.auth = { token: accessToken };

        socket.on('connect', () => {
          console.log('Connected to server!');
          socket.emit('addMessage', 'Hello there from Client!');
        });

        setStatus(AuthStatus.SignedIn);
      } catch (err) {
        setStatus(AuthStatus.SignedOut);
      }
    }
    checkIfUserIsSignedIn();

    return () => {
      socket.disconnect();
    };
  }, []);

  const getUserSession = useCallback(async () => {
    const userSession = await cognito.getSession();
    return userSession;
  }, []);

  const signInUserWithEmailAndPassword = useCallback(async (email: string, password: string) => {
    try {
      const cognitoUser = await cognito.signInUserWithEmailAndPassword(email, password);
      const accessToken = cognitoUser.getAccessToken().getJwtToken();
      const refreshToken = cognitoUser.getRefreshToken().getToken();
      if (accessToken && refreshToken) {
        setStatus(AuthStatus.Loading);
        setSession(() => ({
          accessToken,
          refreshToken,
          user: {} as User
        }));
        socket.connect();
        socket.auth = { token: accessToken };

        socket.on('connect', () => {
          console.log('Connected to server!');
          socket.emit('addMessage', 'Hello there from Client!');
        });
        setStatus(AuthStatus.SignedIn);
        return;
      }
    } catch (error: any) {
      setStatus(AuthStatus.SignedOut);
      if (error.code === CognitoError.UserNotConfirmedException) {
        toast.error('Please verify your email address');
      }
      if (error.code === CognitoError.NotAuthorizedException) {
        toast.error('Incorrect email or password entered');
      }
      throw error;
    }
  }, []);

  const signUpUserWithEmailAndPassword = useCallback(
    async (payload: SignUpUserWithEmailPayload) => {
      try {
        const res = await cognito.signUpUserWithEmailAndPassword(payload);
        toast.success('Registration successful, please check your email for a verification code');
        return res;
      } catch (error: any) {
        if (error.code === CognitoError.UsernameExistsException) {
          toast.error('An account with this email already exists');
        }
        throw error;
      }
    },
    []
  );

  /**
   * This function is called when the user is verifying their account
   * after they have initially registered
   */
  const confirmUserRegistration = useCallback(
    async (username: string, code: string, hasPassword?: boolean) => {
      try {
        await cognito.confirmUserRegistration(username, code);
        if (hasPassword) {
          toast.success('Your email address has been verified');
        } else {
          toast.success('Your email address has been verified, please login');
        }
      } catch (error: any) {
        if (error.code === CognitoError.ExpiredCodeException) {
          toast.error('Verification code has expired, please request a new one');
        }
        if (error.code === CognitoError.CodeMismatchException) {
          toast.error(
            'Invalid verification code entered, please try again or a request a new one.'
          );
        }
        if (error.code === CognitoError.NotAuthorizedException) {
          toast.error('This email has already been verified, please login');
        }
        throw error;
      }
    },
    []
  );

  /**
   * In the case of verifying a user's email after they have initially registered,
   * this function can be used to resend a confirmation code
   */
  const resendConfirmationCode = useCallback(async (username: string) => {
    try {
      await cognito.resendConfirmationCode(username);
      toast.success('A new verification code has been sent to your email');
    } catch (error: any) {
      if (error.code === CognitoError.LimitExceededException) {
        toast.error("You've sent too many requests. Please try again later");
      }
      throw error;
    }
  }, []);

  /**
   * Will trigger an email to go out to the given email address
   * with a password reset code
   */
  const forgotUserPassword = useCallback(async (username: string) => {
    try {
      await cognito.forgotUserPassword(username);
    } catch (error: any) {
      if (error.code === CognitoError.LimitExceededException) {
        toast.error("You've sent too many requests. Please try again later");
      }
      throw error;
    }
  }, []);

  /**
   * Taking in the email, the password reset code attained from the email
   * sent out by forgotUserPassword, and the new password given by the user,
   * will attempt to change the user's password
   */
  const confirmUserPassword = useCallback(
    async (username: string, code: string, password: string) => {
      try {
        await cognito.confirmUserPassword(username, code, password);
        toast.success('Your password has been changed, please login');
      } catch (error: any) {
        if (error.code === CognitoError.CodeMismatchException) {
          toast.error('Invalid verification code entered, please try again or request a new one.');
        }
        throw error;
      }
    },
    []
  );

  /**
   * Changes a user's password while they are logged in
   */
  const changeUserPassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      await cognito.changeUserPassword(oldPassword, newPassword);
      toast.success('Password changed successfully');
    } catch (error: any) {
      if (error.code === CognitoError.NotAuthorizedException) {
        toast.error('Current password entered is incorrect');
      }
      if (error.code === CognitoError.LimitExceededException) {
        toast.error("You've sent too many requests. Please try again later");
      }
      throw error;
    }
  }, []);

  const changeUserEmail = useCallback(async (oldEmail: string, newEmail: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await cognito.changeUserEmail(oldEmail, newEmail);
    } catch (error: any) {
      throw error;
    }
  }, []);

  const verifyUserNewEmail = useCallback(async (code: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await cognito.verifyUserNewEmail(code);
    } catch (error: any) {
      throw error;
    }
  }, []);

  const signOutUser = useCallback(() => {
    cognito.signOutUser();
    setStatus(AuthStatus.SignedOut);
    setSession({} as AuthSession);
  }, []);

  if (status === AuthStatus.Loading) {
    return <LinearProgress />;
  }

  const value = {
    getUserSession,
    signInUserWithEmailAndPassword,
    signUpUserWithEmailAndPassword,
    confirmUserRegistration,
    signOutUser,
    resendConfirmationCode,
    forgotUserPassword,
    confirmUserPassword,
    changeUserPassword,
    changeUserEmail,
    verifyUserNewEmail,
    session,
    setSession,
    status
  };

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
