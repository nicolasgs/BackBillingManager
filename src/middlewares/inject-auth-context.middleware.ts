import { NextFunction, Request, Response } from 'express'

export function injectAuthContextToBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.companyId || !req.user?.id) {
    res.status(401).json({
      success: false,
      code: 'AUTH_CONTEXT_MISSING',
      message: 'Authenticated user context is missing companyId or userId',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    })
    return
  }

  req.body = {
    ...req.body,
    companyId: req.user.companyId,
    companyPublicId: req.user.companyPublicId ?? null,
    createdBy: req.user.id,
  }

  next()
}