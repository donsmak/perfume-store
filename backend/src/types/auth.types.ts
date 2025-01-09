export interface RegisterRequest {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface LoginRequest {
  body: {
    email: string;
    password: string;
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface JwtPayload {
  userId: number;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpires: Date;
}
