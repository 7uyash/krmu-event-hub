import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  actorUserId,
  actorEmail,
  action,
  detail,
  meta = {},
}) => {
  try {
    await AuditLog.create({
      actorUserId,
      actorEmail,
      action,
      detail,
      meta,
    });
  } catch (error) {
    console.error('Audit log write failed:', error.message);
  }
};

