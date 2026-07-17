import { Request, Response, NextFunction } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const region = process.env.AWS_COGNITO_REGION
const userPoolId = process.env.AWS_COGNITO_USERPOOL_ID

if (!region || !userPoolId) {
  throw new Error('Missing Cognito environment variables')
}

const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`

const JWKS = createRemoteJWKSet(
  new URL(`${issuer}/.well-known/jwks.json`)
)

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Missing authorization token',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      })
      return
    }

    const accessToken = authHeader.replace('Bearer ', '').trim()

    const idToken = req.headers['x-id-token'] as string | undefined

    if (!idToken) {
      res.status(401).json({
        success: false,
        code: 'MISSING_ID_TOKEN',
        message: 'Missing X-ID-Token header',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      })
      return
    }

    const { payload: accessPayload } = await jwtVerify(accessToken, JWKS, {
      issuer,
    })

    if (accessPayload.token_use !== 'access') {
      res.status(401).json({
        success: false,
        code: 'INVALID_ACCESS_TOKEN',
        message: 'Invalid access token',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      })
      return
    }

    const { payload: idPayload } = await jwtVerify(idToken, JWKS, {
      issuer,
    })

    if (idPayload.token_use !== 'id') {
      res.status(401).json({
        success: false,
        code: 'INVALID_ID_TOKEN',
        message: 'Invalid ID token',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      })
      return
    }

    if (accessPayload.sub !== idPayload.sub) {
      res.status(401).json({
        success: false,
        code: 'TOKEN_MISMATCH',
        message: 'AccessToken and IdToken belong to different users',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      })
      return
    }

    const groups = accessPayload['cognito:groups']
    const roles = Array.isArray(groups) ? groups.map(String) : []

    
    req.user = {
      id: String(idPayload.sub),
      email: idPayload.email ? String(idPayload.email) : undefined,
      roles,
      companyId: idPayload['custom:company_id']
        ? Number(idPayload['custom:company_id'])
        : undefined,
      companyPublicId: idPayload['custom:company_public_id']
        ? String(idPayload['custom:company_public_id'])
        : undefined,
      firstName: idPayload.given_name
        ? String(idPayload.given_name)
        : undefined,
      lastName: idPayload.family_name
        ? String(idPayload.family_name)
        : undefined,
    }


    next()
  } catch (error) {
    console.error(error)

    res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired token',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    })
  }
}